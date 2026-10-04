import { GetNoteDetailUseCase } from '@ben/domain-chat/application/use-cases/captures/get-note-detail'
import { NotePresenter } from '@ben/server-ben/presenters/note-presenter'
import { noteRepository } from '@ben/server-ben/repositories'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const noteParamsSchema = z.object({
  id: z.string(),
})

const getNoteDetailUseCase = new GetNoteDetailUseCase(noteRepository)

export async function getNoteDetail(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const result = await getNoteDetailUseCase.execute({
      userId: request.userId,
      noteId: noteParamsSchema.parse(request.params).id,
    })

    return response
      .status(HttpStatus.OK)
      .json({ item: NotePresenter.toHttp(result.item) })
  } catch (error) {
    next(error)
  }
}
