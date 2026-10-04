import { TranscribeAudioUseCase } from '@ben/domain-transcription/application/use-cases/transcription/transcribe-audio'
import { AssemblyAITranscriptionProvider } from '@ben/infra-adapters'
import { ValidationError } from '@ben/domain-base'
import { HttpStatus } from '@ben/modules-utils'
import { NextFunction, Request, Response } from 'express'

const transcriptionProvider = new AssemblyAITranscriptionProvider()
const transcribeAudioUseCase = new TranscribeAudioUseCase(transcriptionProvider)

export async function transcription(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    if (!request.file) {
      throw new ValidationError({ errorField: 'audio', code: 'REQUIRED' })
    }

    const result = await transcribeAudioUseCase.execute({
      audio: request.file.buffer,
      mimeType: request.file.mimetype,
    })

    return response.status(HttpStatus.OK).json({ text: result.text })
  } catch (error) {
    next(error)
  }
}
