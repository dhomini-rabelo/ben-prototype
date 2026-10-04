import { ListNotesUseCase } from '@ben/domain-chat/application/use-cases/captures/list-notes'
import { NotePresenter } from '@ben/server-ben/presenters/note-presenter'
import { noteRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
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
