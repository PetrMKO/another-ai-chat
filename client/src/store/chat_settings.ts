import { create } from 'zustand'
import {User} from "@/api/api";

type ChatSettingsState = Pick<User, 'system_msg' | 'msg_count'>

type ChatSettingsAction = {
  setSystemMsg: (msg: string) => void
  setMsgCount: (count: number) => void
}

type ChatSettingsStore = ChatSettingsState & ChatSettingsAction

export const useChatSettingsStore = create<ChatSettingsStore>(
    (set) => ({
      system_msg: '',
      msg_count: 0,
      setMsgCount: (count) => set({ msg_count: count }),
      setSystemMsg: (msg) => set({ system_msg: msg }),
    })
)
