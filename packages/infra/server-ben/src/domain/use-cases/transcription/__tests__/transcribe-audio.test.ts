import { beforeEach, describe, expect, it } from 'vitest'

import { FakeTranscriptionProvider, expectError } from '@/modules/tests'
import { ValidationError } from '@ben/domain-base'

import { TranscribeAudioUseCase } from '@/domain/use-cases/transcription/transcribe-audio'

describe('TranscribeAudioUseCase', () => {
  let transcriptionProvider: FakeTranscriptionProvider
  let sut: TranscribeAudioUseCase

  beforeEach(() => {
    transcriptionProvider = new FakeTranscriptionProvider()
    sut = new TranscribeAudioUseCase(transcriptionProvider)
  })

  it('returns the provider text and forwards audio and mime type', async () => {
    const audio = Buffer.from('audio-bytes')
    transcriptionProvider.respondWith('hello world')

    const response = await sut.execute({ audio, mimeType: 'audio/webm' })

    expect(response).toEqual({ text: 'hello world' })
    expect(transcriptionProvider.receivedPayloads).toEqual([
      { audio, mimeType: 'audio/webm' },
    ])
  })

  it('forwards an undefined mime type when none is given', async () => {
    const audio = Buffer.from('audio-bytes')
    transcriptionProvider.respondWith('hello world')

    await sut.execute({ audio })

    expect(transcriptionProvider.receivedPayloads).toEqual([
      { audio, mimeType: undefined },
    ])
  })

  it('rejects an empty audio buffer', async () => {
    const error = await expectError(async () => {
      await sut.execute({ audio: Buffer.alloc(0) })
    }, ValidationError)

    expect(error.response.errorField).toBe('audio')
    expect(error.response.code).toBe('EMPTY_AUDIO')
    expect(transcriptionProvider.receivedPayloads).toEqual([])
  })

  it('rejects a missing audio', async () => {
    const error = await expectError(async () => {
      await sut.execute({ audio: undefined as unknown as Buffer })
    }, ValidationError)

    expect(error.response.errorField).toBe('audio')
    expect(error.response.code).toBe('EMPTY_AUDIO')
    expect(transcriptionProvider.receivedPayloads).toEqual([])
  })
})
