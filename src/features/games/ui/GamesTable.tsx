import { Button, Empty, Space, Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'

import { getFamilyByPlatform } from '../../../shared/constants/platforms'
import { StatusTag } from '../../../shared/ui/StatusTag'
import type { Game, Platform } from '../../../shared/types/game'

const platformLabels: Partial<Record<Platform, string>> = {
  pc: 'PC',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  switch: 'Switch',
  mobile: 'Mobile',
  other: 'Otra',
}

function getPlatformLabel(platform: Platform): string {
  return platformLabels[platform] ?? platform
}

function getPlatformFamilyLabel(game: Game): string {
  return game.platformFamily ?? getFamilyByPlatform(game.platform) ?? '-'
}

interface GamesTableProps {
  games: Game[]
  onEdit: (game: Game) => void
  onComplete: (id: string) => void
}

export function GamesTable({ games, onEdit, onComplete }: GamesTableProps) {
  const columns: ColumnsType<Game> = [
    {
      title: 'Titulo',
      dataIndex: 'title',
      key: 'title',
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: 'Familia',
      key: 'platformFamily',
      render: (_, record) => getPlatformFamilyLabel(record),
    },
    {
      title: 'Plataforma',
      dataIndex: 'platform',
      key: 'platform',
      render: (value: Platform) => getPlatformLabel(value),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (_, record) => <StatusTag status={record.status} />,
    },
    {
      title: 'Genero',
      dataIndex: 'genre',
      key: 'genre',
    },
    {
      title: 'Ano',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Nota',
      dataIndex: 'rating',
      key: 'rating',
      render: (value?: number) => (value === undefined ? '-' : value),
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => onEdit(record)}>Editar</Button>
          <Button
            type="primary"
            onClick={() => onComplete(record.id)}
            disabled={record.status === 'completed'}
          >
            Completar
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Table<Game>
      rowKey="id"
      columns={columns}
      dataSource={games}
      pagination={false}
      locale={{ emptyText: <Empty description="No hay juegos" /> }}
    />
  )
}
