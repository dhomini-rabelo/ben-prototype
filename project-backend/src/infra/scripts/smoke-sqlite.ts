import { existsSync, mkdirSync, rmSync } from 'node:fs'

import { PrismaClient } from '@/generated/prisma/client'

import { Task, TaskProps, PendingDiff } from '@/domain/entities/task'

import { ID, createID } from '@/modules/domain/entity/id'
import {
  BetweenQuery,
  ContainsQuery,
  GreaterQuery,
  InQuery,
  LowerOrEqualQuery,
  NotEqualQuery,
  NotInQuery,
  NotNullQuery,
} from '@/modules/domain/repository/queries'
import {
  RepeatedResource,
  ResourceNotFoundError,
} from '@/modules/domain/repository/repository-errors'

import { createPrismaClient } from '@/infra/services/prisma'
import { SqliteReminderRepository } from '@/infra/services/repositories/sqlite-reminder-repository'
import { SqliteTaskRepository } from '@/infra/services/repositories/sqlite-task-repository'
import { SqliteUserRepository } from '@/infra/services/repositories/sqlite-user-repository'

const TMP_DIR = '.tmp'
const DB_FILE = `${TMP_DIR}/smoke-sqlite.db`
const DATABASE_URL = `file:./${DB_FILE}`
const TABLE_NAMES = [
  'messages',
  'notes',
  'reminders',
  'tasks',
  'topics',
  'topic_summaries',
  'users',
]

const NOW = new Date('2024-01-01T00:00:00.000Z')

function hoursAfterNow(hours: number): Date {
  return new Date(NOW.getTime() + hours * 60 * 60 * 1000)
}

interface CaseResult {
  label: string
  description: string
  passed: boolean
  reason?: string
}

const results: CaseResult[] = []
let caseCounter = 0

async function runCase(
  description: string,
  fn: () => Promise<void>,
): Promise<void> {
  caseCounter += 1
  const label = String(caseCounter).padStart(2, '0')
  try {
    await fn()
    results.push({ label, description, passed: true })
    console.log(`PASS  ${label} ${description}`)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    results.push({ label, description, passed: false, reason })
    console.log(`FAIL  ${label} ${description} — ${reason}`)
  }
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

async function assertRejectsWith(
  action: () => Promise<unknown>,
  ErrorClass: abstract new (...args: any[]) => Error,
): Promise<void> {
  try {
    await action()
  } catch (error) {
    if (error instanceof ErrorClass) return
    throw new Error(
      `expected ${ErrorClass.name}, got ${
        error instanceof Error ? error.constructor.name : String(error)
      }`,
    )
  }
  throw new Error(`expected ${ErrorClass.name}, but nothing was thrown`)
}

function sameIdSet(a: { id: ID }[], b: { id: ID }[]): boolean {
  const idsA = new Set(a.map((item) => item.id.toValue()))
  const idsB = new Set(b.map((item) => item.id.toValue()))
  if (idsA.size !== idsB.size) return false
  return [...idsA].every((id) => idsB.has(id))
}

function resetDatabaseFile(): void {
  mkdirSync(TMP_DIR, { recursive: true })
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    const path = `${DB_FILE}${suffix}`
    if (existsSync(path)) rmSync(path)
  }
}

async function createSchema(client: PrismaClient): Promise<void> {
  for (const table of TABLE_NAMES) {
    await client.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "${table}" ("id" TEXT NOT NULL PRIMARY KEY, "props" TEXT NOT NULL, "types" TEXT NOT NULL)`,
    )
  }
}

const baseUserId = createID()

function buildTaskProps(overrides: Partial<TaskProps> = {}): TaskProps {
  return {
    userId: baseUserId,
    messageId: null,
    title: 'Untitled task',
    contentType: 'text',
    textContent: 'content',
    todoItems: null,
    pendingDiff: null,
    summary: 'summary',
    status: 'created',
    lastActivityAt: NOW,
    finishedAt: null,
    createdAt: NOW,
    ...overrides,
  }
}

async function runTaskCoreCases(
  taskRepository: SqliteTaskRepository,
): Promise<void> {
  let created: Task

  await runCase('create returns an entity with id and props', async () => {
    created = await taskRepository.create(
      buildTaskProps({ title: 'First task' }),
    )
    assert(created.id instanceof ID, 'id is not an ID instance')
    assert(created.props.title === 'First task', 'title does not match')
  })

  await runCase(
    'get returns the entity and hydrates ID/Date/null props',
    async () => {
      const found = await taskRepository.get({ id: created.id })
      assert(found.props.createdAt instanceof Date, 'createdAt is not a Date')
      assert(found.props.userId instanceof ID, 'userId is not an ID')
      assert(
        found.props.finishedAt === null,
        'finishedAt should have stayed null',
      )
    },
  )

  await runCase('get with no match throws ResourceNotFoundError', async () => {
    await assertRejectsWith(
      () => taskRepository.get({ id: createID() }),
      ResourceNotFoundError,
    )
  })

  await runCase(
    'update changes the given field and keeps the others',
    async () => {
      const updated = await taskRepository.update(created.id, {
        summary: 'updated summary',
      })
      assert(
        updated.props.summary === 'updated summary',
        'summary was not updated',
      )
      assert(updated.props.title === 'First task', 'title should be kept')
    },
  )

  await runCase(
    'update of a missing id throws ResourceNotFoundError',
    async () => {
      await assertRejectsWith(
        () => taskRepository.update(createID(), { summary: 'x' }),
        ResourceNotFoundError,
      )
    },
  )

  await runCase(
    'update turning finishedAt null into a Date returns a Date',
    async () => {
      const updated = await taskRepository.update(created.id, {
        finishedAt: hoursAfterNow(1),
      })
      assert(
        updated.props.finishedAt instanceof Date,
        'finishedAt is not a Date after update',
      )
    },
  )

  await runCase(
    'update replacing pendingDiff null with a nested Date rehydrates it',
    async () => {
      const pendingDiff: PendingDiff = {
        turnId: 'turn-1',
        proposedBy: 'ben',
        changes: { contentType: 'text', before: 'a', after: 'b' },
        createdAt: hoursAfterNow(2),
      }
      const updated = await taskRepository.update(created.id, {
        pendingDiff,
      })
      assert(updated.props.pendingDiff !== null, 'pendingDiff is still null')
      assert(
        updated.props.pendingDiff.createdAt instanceof Date,
        'pendingDiff.createdAt is not a Date right after update',
      )
      const reloaded = await taskRepository.get({ id: created.id })
      assert(
        reloaded.props.pendingDiff !== null &&
          reloaded.props.pendingDiff.createdAt instanceof Date,
        'pendingDiff.createdAt did not survive the round-trip',
      )
    },
  )

  await runCase('delete returns the entity and removes it', async () => {
    const deleted = await taskRepository.delete(created.id)
    assert(deleted.props.title === 'First task', 'deleted title mismatch')
    await assertRejectsWith(
      () => taskRepository.get({ id: created.id }),
      ResourceNotFoundError,
    )
  })

  await runCase(
    'delete of a missing id throws ResourceNotFoundError',
    async () => {
      await assertRejectsWith(
        () => taskRepository.delete(createID()),
        ResourceNotFoundError,
      )
    },
  )

  let duplicateA: Task
  await runCase('findUnique with a single match returns it', async () => {
    duplicateA = await taskRepository.create(
      buildTaskProps({ title: 'Duplicate title' }),
    )
    const found = await taskRepository.findUnique({
      title: 'Duplicate title',
    })
    assert(found !== null, 'expected a match')
    assert(found.id.isEqual(duplicateA.id), 'returned the wrong entity')
  })

  await runCase('findUnique with no match returns null', async () => {
    const found = await taskRepository.findUnique({ title: 'Nobody home' })
    assert(found === null, 'expected null')
  })

  let duplicateB: Task
  await runCase(
    'findUnique with two matches throws RepeatedResource',
    async () => {
      duplicateB = await taskRepository.create(
        buildTaskProps({ title: 'Duplicate title' }),
      )
      await assertRejectsWith(
        () => taskRepository.findUnique({ title: 'Duplicate title' }),
        RepeatedResource,
      )
    },
  )

  await runCase('get with two matches throws RepeatedResource', async () => {
    await assertRejectsWith(
      () => taskRepository.get({ title: 'Duplicate title' }),
      RepeatedResource,
    )
  })

  await runCase('findFirst with matches returns one of them', async () => {
    const found = await taskRepository.findFirst({
      title: 'Duplicate title',
    })
    assert(found !== null, 'expected a match')
    assert(
      found.id.isEqual(duplicateA.id) || found.id.isEqual(duplicateB.id),
      'returned an unrelated entity',
    )
  })

  await runCase('findFirst with no match returns null', async () => {
    const found = await taskRepository.findFirst({ title: 'Nobody home' })
    assert(found === null, 'expected null')
  })

  await runCase('clone() returns a working repository', async () => {
    const cloned = taskRepository.clone()
    const viaClone = await cloned.create(
      buildTaskProps({ title: 'Created through clone()' }),
    )
    assert(viaClone.id instanceof ID, 'clone() did not return a usable id')
    await taskRepository.delete(viaClone.id)
  })

  await taskRepository.deleteMany({})
}

interface TaskDataset {
  t1: Task
  t2: Task
  t3: Task
  t4: Task
  t5: Task
}

async function seedTaskDataset(
  taskRepository: SqliteTaskRepository,
): Promise<TaskDataset> {
  const t1 = await taskRepository.create(
    buildTaskProps({
      title: 'Buy milk at the store',
      status: 'created',
      messageId: null,
      createdAt: hoursAfterNow(1),
    }),
  )
  const t2 = await taskRepository.create(
    buildTaskProps({
      title: 'Weekly Reunião report',
      status: 'active',
      messageId: createID(),
      createdAt: hoursAfterNow(2),
    }),
  )
  const t3 = await taskRepository.create(
    buildTaskProps({
      title: 'Clean the house',
      status: 'finished',
      messageId: null,
      createdAt: hoursAfterNow(3),
      finishedAt: hoursAfterNow(3.5),
    }),
  )
  const t4 = await taskRepository.create(
    buildTaskProps({
      title: 'Write the monthly report',
      status: 'active',
      messageId: createID(),
      createdAt: hoursAfterNow(4),
    }),
  )
  const t5 = await taskRepository.create(
    buildTaskProps({
      title: 'Read a good book',
      status: 'created',
      messageId: null,
      createdAt: hoursAfterNow(5),
    }),
  )
  return { t1, t2, t3, t4, t5 }
}

async function runTaskQueryCases(
  taskRepository: SqliteTaskRepository,
  dataset: TaskDataset,
): Promise<void> {
  await runCase('contains matches case-insensitively on title', async () => {
    const rows = await taskRepository.findMany({
      title: new ContainsQuery({ input: 'REPORT' }),
    })
    assert(
      sameIdSet(rows, [dataset.t2, dataset.t4]),
      `expected t2 and t4, got ${rows.map((r) => r.props.title).join(', ')}`,
    )
  })

  await runCase(
    'contains with an accented, non-ASCII input does not crash',
    async () => {
      const rows = await taskRepository.findMany({
        title: new ContainsQuery({ input: 'REUNIÃO' }),
      })
      assert(Array.isArray(rows), 'expected an array back')
    },
  )

  await runCase('lowerOrEqual filters Date props', async () => {
    const rows = await taskRepository.findMany({
      createdAt: new LowerOrEqualQuery({ input: hoursAfterNow(3) }),
    })
    assert(
      sameIdSet(rows, [dataset.t1, dataset.t2, dataset.t3]),
      `expected t1, t2 and t3, got ${rows.length} rows`,
    )
  })

  await runCase('greater filters Date props', async () => {
    const rows = await taskRepository.findMany({
      createdAt: new GreaterQuery({ input: hoursAfterNow(3) }),
    })
    assert(
      sameIdSet(rows, [dataset.t4, dataset.t5]),
      `expected t4 and t5, got ${rows.length} rows`,
    )
  })

  await runCase('between filters Date props', async () => {
    const rows = await taskRepository.findMany({
      createdAt: new BetweenQuery({
        from: hoursAfterNow(2),
        to: hoursAfterNow(4),
      }),
    })
    assert(
      sameIdSet(rows, [dataset.t2, dataset.t3, dataset.t4]),
      `expected t2, t3 and t4, got ${rows.length} rows`,
    )
  })

  await runCase('in matches any of the given values', async () => {
    const rows = await taskRepository.findMany({
      status: new InQuery({ input: ['created', 'finished'] }),
    })
    assert(
      sameIdSet(rows, [dataset.t1, dataset.t3, dataset.t5]),
      `expected t1, t3 and t5, got ${rows.length} rows`,
    )
  })

  await runCase('notIn excludes the given values', async () => {
    const rows = await taskRepository.findMany({
      status: new NotInQuery({ input: ['active'] }),
    })
    assert(
      sameIdSet(rows, [dataset.t1, dataset.t3, dataset.t5]),
      `expected t1, t3 and t5, got ${rows.length} rows`,
    )
  })

  await runCase(
    'notNull matches rows where the field is set, with a null row present',
    async () => {
      const rows = await taskRepository.findMany({
        messageId: new NotNullQuery(),
      })
      assert(
        sameIdSet(rows, [dataset.t2, dataset.t4]),
        `expected t2 and t4, got ${rows.length} rows`,
      )
    },
  )

  await runCase(
    'notEqual includes null rows, proving the null-handling fix',
    async () => {
      const rows = await taskRepository.findMany({
        messageId: new NotEqualQuery({
          input: dataset.t2.props.messageId!.toValue(),
        }),
      })
      assert(
        sameIdSet(rows, [dataset.t1, dataset.t3, dataset.t4, dataset.t5]),
        `expected t1, t3, t4 and t5 (t2 excluded, nulls included), got ${rows.length} rows`,
      )
    },
  )
}

async function runTaskPaginationCases(
  taskRepository: SqliteTaskRepository,
  dataset: TaskDataset,
): Promise<void> {
  await runCase(
    'findManyWithPagination returns the requested offset page',
    async () => {
      const page = await taskRepository.findManyWithPagination(
        {},
        { limit: 2, page: 2, orderBy: 'createdAt', order: 'asc' },
      )
      assert(
        page.totalItems === 5,
        `expected totalItems 5, got ${page.totalItems}`,
      )
      assert(page.page === 2, `expected page 2, got ${page.page}`)
      assert(
        page.items.length === 2 &&
          page.items[0].id.isEqual(dataset.t3.id) &&
          page.items[1].id.isEqual(dataset.t4.id),
        'expected items 3 and 4 (t3, t4) on page 2',
      )
    },
  )

  await runCase(
    'findManyWithCursorPagination walks every row exactly once',
    async () => {
      const collected: Task[] = []
      let cursor: string | null = null
      let hasMore = true
      let lastPageHadMore = true
      let lastPageCursor: string | null = 'sentinel'
      let guard = 0

      while (hasMore) {
        guard += 1
        assert(guard <= 10, 'cursor pagination did not terminate')
        const page = await taskRepository.findManyWithCursorPagination(
          {},
          { limit: 2, orderBy: 'createdAt', order: 'asc', cursor },
        )
        collected.push(...page.items)
        hasMore = page.hasMore
        cursor = page.nextCursor
        lastPageHadMore = page.hasMore
        lastPageCursor = page.nextCursor
      }

      assert(
        sameIdSet(collected, [
          dataset.t1,
          dataset.t2,
          dataset.t3,
          dataset.t4,
          dataset.t5,
        ]),
        `expected all 5 rows exactly once, got ${collected.length}`,
      )
      const uniqueIds = new Set(collected.map((item) => item.id.toValue()))
      assert(
        uniqueIds.size === collected.length,
        'a row was returned more than once across pages',
      )
      assert(lastPageHadMore === false, 'last page should have hasMore false')
      assert(lastPageCursor === null, 'last page should have nextCursor null')
    },
  )
}

async function runTaskAggregateCases(
  taskRepository: SqliteTaskRepository,
  dataset: TaskDataset,
): Promise<void> {
  await runCase(
    'count matches the size of findMany with no filter',
    async () => {
      const all = await taskRepository.findMany({})
      const total = await taskRepository.count({})
      assert(
        all.length === 5,
        `expected 5 rows from findMany, got ${all.length}`,
      )
      assert(
        total === all.length,
        `expected count === ${all.length}, got ${total}`,
      )
    },
  )

  await runCase(
    'updateMany updates every row matching the filter',
    async () => {
      const updated = await taskRepository.updateMany(
        { status: new InQuery({ input: ['created'] }) },
        { summary: 'archived' },
      )
      assert(
        sameIdSet(updated, [dataset.t1, dataset.t5]),
        `expected t1 and t5 updated, got ${updated.length}`,
      )
      assert(
        updated.every((item) => item.props.summary === 'archived'),
        'not every updated row has the new summary',
      )
      const reloaded = await taskRepository.get({ id: dataset.t1.id })
      assert(
        reloaded.props.summary === 'archived',
        'update did not persist for t1',
      )
    },
  )

  await runCase(
    'deleteMany removes every row matching the filter',
    async () => {
      await taskRepository.deleteMany({ status: 'finished' })
      const remaining = await taskRepository.count({})
      assert(remaining === 4, `expected 4 rows left, got ${remaining}`)
      await assertRejectsWith(
        () => taskRepository.get({ id: dataset.t3.id }),
        ResourceNotFoundError,
      )
    },
  )

  await taskRepository.deleteMany({})
}

async function runTaskEdgeCases(
  taskRepository: SqliteTaskRepository,
): Promise<void> {
  await runCase('todoItems: [] round-trips as [] and not as null', async () => {
    const task = await taskRepository.create(
      buildTaskProps({ contentType: 'todo', todoItems: [] }),
    )
    assert(
      Array.isArray(task.props.todoItems) && task.props.todoItems.length === 0,
      'todoItems should be an empty array right after create',
    )
    const reloaded = await taskRepository.get({ id: task.id })
    assert(
      Array.isArray(reloaded.props.todoItems),
      'todoItems became null after the round-trip',
    )
    assert(
      reloaded.props.todoItems!.length === 0,
      'todoItems should still be empty after the round-trip',
    )
    await taskRepository.delete(task.id)
  })
}

async function runReminderCases(
  reminderRepository: SqliteReminderRepository,
): Promise<void> {
  await runCase(
    'Reminder.remindAt stays a string and never becomes a Date',
    async () => {
      const reminder = await reminderRepository.create({
        userId: baseUserId,
        title: 'Take medication',
        remindAt: '2024-06-01T10:00:00.000Z',
        notes: null,
        createdAt: NOW,
      })
      assert(
        typeof reminder.props.remindAt === 'string',
        'remindAt should be a string right after create',
      )
      const reloaded = await reminderRepository.get({ id: reminder.id })
      assert(
        typeof reloaded.props.remindAt === 'string' &&
          !((reloaded.props.remindAt as unknown as Date) instanceof Date),
        'remindAt turned into a Date after the round-trip',
      )
      await reminderRepository.delete(reminder.id)
    },
  )
}

async function runUserCases(
  userRepository: SqliteUserRepository,
): Promise<void> {
  await runCase(
    'User round-trips through create/get with hydrated Date',
    async () => {
      const user = await userRepository.create({
        name: 'Ada Lovelace',
        username: 'ada',
        email: 'ada@example.com',
        avatarUrl: 'https://example.com/ada.png',
        providerId: 'provider-1',
        createdAt: NOW,
      })
      const reloaded = await userRepository.get({ id: user.id })
      assert(
        reloaded.props.email === 'ada@example.com',
        'email does not match after round-trip',
      )
      assert(
        reloaded.props.createdAt instanceof Date,
        'createdAt is not a Date after round-trip',
      )
      await userRepository.delete(user.id)
    },
  )
}

function printSummary(): void {
  const passed = results.filter((result) => result.passed).length
  const failed = results.length - passed
  console.log('')
  console.log(`RESULT: ${passed} PASS / ${failed} FAIL`)
  process.exitCode = failed > 0 ? 1 : 0
}

async function main(): Promise<void> {
  resetDatabaseFile()
  const client = createPrismaClient(DATABASE_URL)
  try {
    await createSchema(client)

    const taskRepository = new SqliteTaskRepository(client)
    const reminderRepository = new SqliteReminderRepository(client)
    const userRepository = new SqliteUserRepository(client)

    await runTaskCoreCases(taskRepository)

    const dataset = await seedTaskDataset(taskRepository)
    await runTaskQueryCases(taskRepository, dataset)
    await runTaskPaginationCases(taskRepository, dataset)
    await runTaskAggregateCases(taskRepository, dataset)

    await runTaskEdgeCases(taskRepository)
    await runReminderCases(reminderRepository)
    await runUserCases(userRepository)
  } finally {
    await client.$disconnect()
    resetDatabaseFile()
  }
  printSummary()
}

main().catch((error) => {
  console.error('Smoke script crashed before finishing:', error)
  process.exitCode = 1
})
