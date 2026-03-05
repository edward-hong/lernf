import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Advocate, AdvocateSession, SessionAnalysis } from '../types/advocate'

interface AdvocateState {
  currentSession: AdvocateSession | null
  selectedAdvocates: Advocate[]
  proposalText: string
  userResponseText: string
  loading: boolean
  error: string | null
  sessionAnalysis: SessionAnalysis | null
  transcript: string | null

  selectAdvocate: (advocate: Advocate) => void
  deselectAdvocate: (advocateId: string) => void
  setProposal: (text: string) => void
  setUserResponse: (text: string) => void
  startSession: (proposal: string, advocates: Advocate[]) => Promise<void>
  continueSession: (response: string) => Promise<void>
  endSession: () => Promise<void>
  resetSession: () => void
}

export const useAdvocateStore = create<AdvocateState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      selectedAdvocates: [],
      proposalText: '',
      userResponseText: '',
      loading: false,
      error: null,
      sessionAnalysis: null,
      transcript: null,

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

      setUserResponse: (text) => {
        set({ userResponseText: text })
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
              rounds: [
                {
                  roundNumber: 1,
                  critiques: data.critiques
                }
              ],
              status: 'deliberating',
              currentRound: 1
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

      continueSession: async (response) => {
        const session = get().currentSession
        if (!session) {
          throw new Error('No active session')
        }

        set({ loading: true, error: null })

        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

          const apiResponse = await fetch(`${API_URL}/api/advocates/continue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              userResponse: response
            })
          })

          if (!apiResponse.ok) {
            throw new Error('Failed to continue session')
          }

          const data = await apiResponse.json()

          // Add user's response to previous round
          const updatedRounds = [...session.rounds]
          updatedRounds[updatedRounds.length - 1].userMessage = response

          // Add new round with new critiques
          updatedRounds.push({
            roundNumber: data.roundNumber,
            critiques: data.critiques
          })

          set({
            currentSession: {
              ...session,
              rounds: updatedRounds,
              currentRound: data.roundNumber
            },
            userResponseText: '',
            loading: false
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            loading: false
          })
        }
      },

      endSession: async () => {
        const session = get().currentSession
        if (!session) {
          throw new Error('No active session')
        }

        set({ loading: true, error: null })

        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

          const response = await fetch(`${API_URL}/api/advocates/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id
            })
          })

          if (!response.ok) {
            throw new Error('Failed to end session')
          }

          const data = await response.json()

          set({
            sessionAnalysis: data.analysis,
            transcript: data.transcript,
            currentSession: {
              ...session,
              status: 'complete'
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
          userResponseText: '',
          sessionAnalysis: null,
          transcript: null,
          error: null
        })
      }
    }),
    {
      name: 'advocate-storage',
      partialize: (state) => ({
        currentSession: state.currentSession,
        selectedAdvocates: state.selectedAdvocates,
        proposalText: state.proposalText,
        sessionAnalysis: state.sessionAnalysis,
        transcript: state.transcript
      })
    }
  )
)
