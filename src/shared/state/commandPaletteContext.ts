import { createContext } from 'react'

export interface CommandPaletteContextValue {
  open: boolean
  setOpen: (open: boolean) => void
}

export const CommandPaletteContext = createContext<CommandPaletteContextValue | undefined>(undefined)
