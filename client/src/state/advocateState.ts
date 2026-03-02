import { create } from 'zustand'
import type { Advocate, AdvocateSession, Critique } from '../types/advocate'

interface AdvocateState {
  // Session data
  currentSession: AdvocateSession | null

  // UI state
  selectedAdvocates: Advocate[]
  proposalText: string

  // Loading
  loading: boolean
  error: string | null

  // Actions
  selectAdvocate: (advocate: Advocate) => void
  deselectAdvocate: (advocateId: string) => void
  setProposal: (text: string) => void
  startSession: (proposal: string, advocates: Advocate[]) => Promise<void>
  resetSession: () => void
}

export const useAdvocateStore = create<AdvocateState>((set, get) => ({
  currentSession: null,
  selectedAdvocates: [],
  proposalText: '',
  loading: false,
  error: null,

  selectAdvocate: (advocate) => {
    const current = get().selectedAdvocates
    if (current.length >= 5) return
    if (current.find(a => a.id === advocate.id)) return
    set({ selectedAdvocates: [...current, advocate] })
  },

  deselectAdvocate: (advocateId) => {
    set({
      selectedAdvocates: get().selectedAdvocates.filter(a => a.id !== advocateId)
    })
  },

  setProposal: (text) => {
    set({ proposalText: text })
  },

  startSession: async (proposal, advocates) => {
    set({ loading: true, error: null })

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

      const response = await fetch(`${API_URL}/api/advocates/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal,
          advocates: advocates.map(a => ({
            id: a.id,
            provider: a.provider,
            model: a.model,
            lens: a.lens
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start session')
      }

      const data = await response.json()

      set({
        currentSession: {
          id: data.sessionId,
          proposal,
          selectedAdvocates: advocates,
          critiques: data.critiques,
          status: 'deliberating'
        },
        loading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false
      })
    }
  },

  resetSession: () => {
    set({
      currentSession: null,
      selectedAdvocates: [],
      proposalText: '',
      error: null
    })
  }
}))
