import { TranscribeAudioUseCase } from '@/domain/use-cases/transcription/transcribe-audio'
import { AssemblyAITranscriptionProvider } from '@/infra/services/assemblyai-transcription-provider'
import { ValidationError } from '@/modules/domain/domain-errors'
import { HttpStatus } from '@/modules/utils/http'
import { NextFunction, Request, Response } from 'express'

const transcriptionProvider = new AssemblyAITranscriptionProvider()
const transcribeAudioUseCase = new TranscribeAudioUseCase(transcriptionProvider)

export async function transcription(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new ValidationError({ errorField: 'audio', code: 'REQUIRED' })
    }

    const result = await transcribeAudioUseCase.execute({
      audio: req.file.buffer,
      mimeType: req.file.mimetype,
    })

    return res.status(HttpStatus.OK).json({ text: result.text })
  } catch (err) {
    next(err)
  }
}
