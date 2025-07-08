import axios from "axios";
import {MessageRole} from "@/types/chat";

export type LlmModel = {
  id: string
  name: string
  pricing: {
    prompt: string
    completion: string
  }
  context_length: string
  chat_na_msg: string
}

export type FetchModels = {
  data: LlmModel[]
}

export type Chat = {
  id: string
  user_id: string
  created_at: string
}

export enum ConfigTypeNames {
  VSEGPT = 'vsegpt',
  X5_COPILOT = 'x5_copilot',
  OWN_CONFIG = 'own',
}

export type ConfigType = {
  id: string
  name: ConfigTypeNames
}

export type Config = {
  id: string
  user_id: string
  type_id: string
  url: string
  api_key?: string
  llm_name?: string
}

export type User = {
  id: string
  system_msg: string
  msg_count: number
  config_id?: string
}

export type UpdateUserSettings = Pick<User, 'msg_count' | 'system_msg' | 'id'>

export type UserInfo = {
  id: string
  chats: Chat[]
  user: User
  config?: Config
}

export type MessageDTO = {
  id: string;
  chat_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export type GenerateMessage = {
  role: MessageRole;
  content: string;
}

export type GenerateResponse = {
  userMessage: MessageDTO;
  assistantMessage: MessageDTO;
}

export type Rag = {
  "id": string;
  "file_name": string;
}

const client = axios.create({
  baseURL: 'http://localhost:8000',
})


// /config/getByUserId
// /config/getTypes
// /config/create

export const api = {
  fetchModels: () => axios.get<FetchModels>('https://api.vsegpt.ru/v1/models'),
  fetchUser: (userId: string) => client.get<UserInfo>(`/user/${userId}`),
  registerUser: () => client.post<UserInfo>('/user/register'),
  createConfig: (config: Partial<Omit<Config, 'id'>>) => client.post<Config>('/config/create', config),
  updateConfig: (config: Partial<Omit<Config, 'type_id' | 'user_id'>>) => client.put<Config>(`config/update/${config.id}`, config),
  fetchConfigTypes: () =>  client.get<ConfigType[]>('/config/getTypes'),
  fetchUserConfigs: (userId: string) => client.get<Config[]>(`/config/getByUserId/${userId}`),
  updateUserSettings: ({id, ...data}: UpdateUserSettings) => client.put<User>(`/user/updateSettings/${id}`, data),
  createChat: (userId: string) => client.post<Chat>(`/chat/create/${userId}`),
  fetchChatMessages: (chatId: string) => client.get<MessageDTO[]>(`/chat/${chatId}/messages`),
  generateResponse: (chatId: string, message: GenerateMessage) => client.post<GenerateResponse>(`/chat/${chatId}/generate`, message),
  getRagFileByUserId: (userId: string) => client.get<Rag>(`/rag/getByUser_id/${userId}`),
  deleteRagFile: (ragId: string) => client.delete<null>(`rag/delete/${ragId}`),
  uploadRagFile: (userId: string, formData: FormData) => client.post<Rag>(`rag/create/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
}
