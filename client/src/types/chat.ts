export enum MessageRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
}

export type Message = {
  role: MessageRole
  content: string
}
