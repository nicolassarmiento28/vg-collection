import { Input } from 'antd'
import { useGamesContext } from '../../features/games/state/GamesContext'

export function HeaderSearch() {
  const { state, dispatch } = useGamesContext()

  return (
    <Input.Search
      value={state.search}
      onChange={(e) => dispatch({ type: 'setSearch', payload: e.target.value })}
      onSearch={(value) => dispatch({ type: 'setSearch', payload: value })}
      placeholder="Buscar juegos, géneros, plataformas…"
      allowClear
      style={{
        width: 380,
        borderRadius: 24,
      }}
      styles={{
        root: {
          background: 'var(--bg-elevated)',
          borderColor: 'var(--border)',
          borderRadius: 24,
        },
      }}
    />
  )
}
