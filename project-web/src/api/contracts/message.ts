import type { Message, MessageCapture } from "../models/message";

export interface CreateMessageRequestData {
  content: string;
}

export interface CreateMessageResponseData {
  userMessage: Message;
  benMessage: Message;
  capture?: MessageCapture;
}
