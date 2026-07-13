import { BarChartOutlined } from '@ant-design/icons'
import type React from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { STATUS_BADGE_COLORS } from '../../../shared/constants/gameStatus'
import type { Game } from '../../../shared/types/game'
import { computeCompletionStats, countByGenre, countByPlatform, countByStatus, countByYear } from '../lib/dashboardStats'

interface CollectionDashboardProps {
  games: Game[]
}

const tooltipStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  color: 'var(--text)',
  fontSize: 12,
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        flex: '1 1 280px',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function CountBarChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--accent-dim)' }} />
        <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CollectionDashboard({ games }: CollectionDashboardProps) {
  if (games.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '32px 16px',
          background: 'var(--bg-surface)',
          border: '1px dashed var(--border)',
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <BarChartOutlined style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 8 }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Agregá juegos a tu colección para ver estadísticas acá.
        </div>
      </div>
    )
  }

  const byPlatform = countByPlatform(games)
  const byGenre = countByGenre(games)
  const byYear = countByYear(games)
  const completion = computeCompletionStats(games)
  const byStatus = countByStatus(games)

  const completionData = [
    { label: 'Completado', count: completion.completed },
    { label: 'Resto', count: completion.total - completion.completed },
  ]

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
      <ChartCard title={`Total: ${completion.total} juego(s)`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <ResponsiveContainer width={100} height={100}>
            <PieChart>
              <Pie
                data={completionData}
                dataKey="count"
                innerRadius={30}
                outerRadius={48}
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="var(--accent)" />
                <Cell fill="var(--border)" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--text-h)', lineHeight: 1 }}>
              {completion.percentCompleted}%
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>completado</div>
          </div>
        </div>

        {/* Desglose completo por estado, complementa el % completado de arriba */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {byStatus.map((entry) => (
            <div key={entry.status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: STATUS_BADGE_COLORS[entry.status].text,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: 'var(--text-muted)', flex: 1 }}>{entry.label}</span>
              <span style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{entry.count}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Juegos por plataforma">
        <CountBarChart data={byPlatform} />
      </ChartCard>

      <ChartCard title="Juegos por género">
        <CountBarChart data={byGenre} />
      </ChartCard>

      <ChartCard title="Juegos por año de lanzamiento">
        <CountBarChart data={byYear} />
      </ChartCard>
    </div>
  )
}
