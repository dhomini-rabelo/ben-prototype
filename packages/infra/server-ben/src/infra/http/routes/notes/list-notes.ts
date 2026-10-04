import { ListNotesUseCase } from '@/domain/use-cases/captures/list-notes'
import { NotePresenter } from '@/infra/http/presenters/note-presenter'
import { noteRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const listNotesUseCase = new ListNotesUseCase(noteRepository)

export async function listNotes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await listNotesUseCase.execute({
      userId: req.userId,
    })

    return res.status(HttpStatus.OK).json({
      items: result.items.map((note) => NotePresenter.toListItemHttp(note)),
    })
  } catch (err) {
    next(err)
  }
}
