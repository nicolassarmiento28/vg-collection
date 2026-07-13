import { Button, Modal } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Game } from '../../../shared/types/game'
import { getBacklogGames, pickRandomBacklogGame } from '../lib/randomPick'

interface WhatToPlayButtonProps {
  games: Game[]
}

const SPIN_TICKS = 14

export function WhatToPlayButton({ games }: WhatToPlayButtonProps) {
  const [open, setOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [displayed, setDisplayed] = useState<Game | null>(null)
  const [result, setResult] = useState<Game | null>(null)
  const navigate = useNavigate()
  const spinTokenRef = useRef(0)

  const backlog = getBacklogGames(games)

  useEffect(() => {
    // Cancel any in-flight spin chain if the component unmounts.
    return () => {
      spinTokenRef.current += 1
    }
  }, [])

  function spin() {
    if (backlog.length === 0) return

    const token = ++spinTokenRef.current
    const target = pickRandomBacklogGame(games)
    setResult(null)
    setSpinning(true)

    let tick = 0
    function step() {
      if (spinTokenRef.current !== token) return // a newer spin (or close) took over
      tick += 1
      if (tick >= SPIN_TICKS) {
        setDisplayed(target)
        setResult(target)
        setSpinning(false)
        return
      }
      setDisplayed(backlog[Math.floor(Math.random() * backlog.length)] ?? null)
      setTimeout(step, 60 + tick * 12)
    }
    step()
  }

  function handleOpen() {
    setOpen(true)
    setResult(null)
    setDisplayed(null)
    spin()
  }

  function handleClose() {
    spinTokenRef.current += 1 // cancel any pending spin ticks
    setOpen(false)
  }

  function goToDetail() {
    if (result === null) return
    navigate(`/coleccion/${result.id}`)
    handleClose()
  }

  return (
    <>
      <Button onClick={handleOpen}>¿Qué juego hoy?</Button>
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        destroyOnHidden
        width={420}
        styles={{
          container: {
            background: 'var(--bg-surface)',
            borderTop: '4px solid var(--accent)',
            borderRadius: 8,
            padding: '32px 36px',
          },
          mask: { backdropFilter: 'blur(4px)' },
        }}
      >
        {backlog.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
            No tenés juegos pendientes en tu backlog.
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 30,
                color: 'var(--text-h)',
                letterSpacing: 1,
                minHeight: 44,
                marginBottom: 20,
              }}
            >
              {displayed?.title ?? '…'}
            </div>
            {!spinning && result !== null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <Button type="primary" onClick={goToDetail}>
                  Ir al detalle
                </Button>
                <Button type="link" onClick={spin} style={{ color: 'var(--accent-text)' }}>
                  Girar de nuevo
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}
