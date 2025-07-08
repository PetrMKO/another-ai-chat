import { create } from 'zustand'
import {Rag} from "@/api/api";

type RagState = {
  rag: null | Rag
}

type RagAction = {
  setRag: (rag: Rag | null) => void
}

type RagStore = RagState & RagAction

export const useRagStore = create<RagStore>(
  (set) => ({
    rag: null,
    setRag: (rag) => set({ rag }),
  })
)
