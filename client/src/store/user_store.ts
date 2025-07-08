import { create } from 'zustand'

type UserState = {
  userId: null | string
}

type UserAction = {
  setUserId: (userId: string) => void
}

type UserStore = UserState & UserAction

export const useUserStore = create<UserStore>(
    (set) => ({
      userId: null,
      setUserId: (userId) => set({ userId }),
    })
)
