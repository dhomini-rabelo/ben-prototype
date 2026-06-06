import { GetNoteDetailUseCase } from '@/domain/use-cases/captures/get-note-detail'
import { NotePresenter } from '@/infra/http/presenters/note-presenter'
import { noteRepository } from '@/infra/http/repositories'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

const noteParamsSchema = z.object({
  id: z.string(),
})

const getNoteDetailUseCase = new GetNoteDetailUseCase(noteRepository)

export async function getNoteDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getNoteDetailUseCase.execute({
      userId: req.userId,
      noteId: noteParamsSchema.parse(req.params).id,
    })

    return res
      .status(HttpStatus.OK)
      .json({ item: NotePresenter.toHttp(result.item) })
  } catch (err) {
    next(err)
  }
}
