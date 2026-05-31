import { MessageCapture } from '@/domain/entities/message'

export function generateBenReply(userContent: string): string {
  return `Got it — I noted: "${userContent}".`
}

export function generateCaptureFromExchange(
  _userContent: string,
): MessageCapture | null {
  return null
}
