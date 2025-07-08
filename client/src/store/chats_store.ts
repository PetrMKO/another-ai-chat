import {create} from "zustand/index";
import {Chat, MessageDTO} from "@/api/api";

type ChatsState = {
  chats: Chat[]
}

type ChatsActions = {
  setChats: (chats: Chat[]) => void,
  addChat: (chat: Chat) => void,
}

type ChatsStore = ChatsState & ChatsActions

export const useChatStore = create<ChatsStore>((set, getState) => ({
  chats: [],
  setChats: (chats) => set({chats}),
  addChat: (chat) => set({chats: [chat, ...getState().chats]}),
}))
