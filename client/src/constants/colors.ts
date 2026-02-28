// ---------------------------------------------------------------------------
// Color Constants — Scenario Message Color Palette
// ---------------------------------------------------------------------------
// Defines Tailwind CSS class sets for every speaker type in the scenario
// engine. NPC colors are shuffled and assigned at scenario init; AI, user,
// and system colors are fixed.
//
// Contrast notes:
//   - Label text uses *-700 on *-50 backgrounds → WCAG AA (≥ 4.5:1)
//   - Border uses *-300 as a medium-weight left-accent stripe
//   - Accent (*-500) is used for icons / highlights, not body text
// ---------------------------------------------------------------------------

import type { NpcColorSlot, ColorClasses } from '../types/scenario'

// ---- NPC Color Palette (6 slots, shuffled per session) --------------------

export const NPC_COLORS: Record<NpcColorSlot, ColorClasses> = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    label: 'text-blue-700',
    accent: 'text-blue-500',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    label: 'text-purple-700',
    accent: 'text-purple-500',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-300',
    label: 'text-green-700',
    accent: 'text-green-500',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    label: 'text-orange-700',
    accent: 'text-orange-500',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    label: 'text-rose-700',
    accent: 'text-rose-500',
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-300',
    label: 'text-teal-700',
    accent: 'text-teal-500',
  },
}

/** Ordered list of all NPC color slot keys. */
export const NPC_COLOR_SLOTS: readonly NpcColorSlot[] = [
  'blue',
  'purple',
  'green',
  'orange',
  'rose',
  'teal',
] as const

// ---- Fixed Colors (not shuffled) ------------------------------------------

/** AI facilitator — always indigo. */
export const AI_COLOR: ColorClasses = {
  bg: 'bg-indigo-50',
  border: 'border-indigo-300',
  label: 'text-indigo-700',
  accent: 'text-indigo-500',
}

/** User's own messages — neutral gray. */
export const USER_COLOR: ColorClasses = {
  bg: 'bg-gray-50',
  border: 'border-gray-300',
  label: 'text-gray-700',
  accent: 'text-gray-500',
}

/** System / narrator messages — light gray, minimal chrome. */
export const SYSTEM_COLOR: ColorClasses = {
  bg: 'bg-slate-50',
  border: 'border-slate-200',
  label: 'text-slate-500',
  accent: 'text-slate-400',
}
