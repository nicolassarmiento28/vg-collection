import { useContext } from 'react'
import { CommandPaletteContext, type CommandPaletteContextValue } from './commandPaletteContext'

export function useCommandPalette(): CommandPaletteContextValue {
  const ctx = useContext(CommandPaletteContext)
  if (ctx === undefined) throw new Error('useCommandPalette must be used inside CommandPaletteProvider')
  return ctx
}
