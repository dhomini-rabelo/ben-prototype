-- Backfill dos lembretes legados com as props de agenda (kind/alerts/etc).
UPDATE reminders
SET props = json_set(
  props,
  '$.kind', 'alarm',
  '$.status', 'active',
  '$.timeZone', 'UTC',
  '$.alerts', json('[{"kind":"at-event"}]'),
  '$.recurrence', json('null'),
  '$.messages', json('[]'),
  '$.checkFrequency', json('null'),
  '$.acknowledgedUntil', json('null'),
  '$.snoozedUntil', json('null'),
  '$.nextFireAt', json('null'),
  '$.completedAt', json('null')
)
WHERE json_extract(props, '$.kind') IS NULL;
