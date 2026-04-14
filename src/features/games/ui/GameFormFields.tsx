// src/features/games/ui/GameFormFields.tsx
import { InboxOutlined } from '@ant-design/icons'
import { Form, Input, InputNumber, Select, Tabs, Upload } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import type { FormInstance } from 'antd'
import type { GameFormValues } from './GameFormModal'
import type { GameStatus } from '../../../shared/types/game'

const statusOptions: Array<{ label: string; value: GameStatus }> = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Jugando', value: 'playing' },
  { label: 'Completado', value: 'completed' },
  { label: 'Pausado', value: 'paused' },
  { label: 'Abandonado', value: 'dropped' },
]

interface GameFormFieldsProps {
  form: FormInstance<GameFormValues>
}

export function GameFormFields({ form }: GameFormFieldsProps) {
  const [coverTab, setCoverTab] = useState<'file' | 'url'>('file')
  const [previewBase64, setPreviewBase64] = useState<string | undefined>(undefined)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [coverUrlPreview, setCoverUrlPreview] = useState<string | undefined>(undefined)

  function handleFileChange({ fileList: newList }: { fileList: UploadFile[] }) {
    setFileList(newList)
    const file = newList[0]?.originFileObj
    if (file == null) {
      setPreviewBase64(undefined)
      form.setFieldValue('coverBase64', undefined)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string | undefined
      setPreviewBase64(result)
      form.setFieldValue('coverBase64', result)
      form.setFieldValue('coverUrl', undefined)
    }
    reader.readAsDataURL(file)
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value
    // Update local preview state and clear base64 when user types a URL
    setCoverUrlPreview(url)
    setPreviewBase64(undefined)
    setFileList([])
    form.setFieldValue('coverBase64', undefined)
  }

  const coverItems = [
    {
      key: 'file',
      label: 'Subir archivo',
      children: (
        <div>
          <Upload.Dragger
            accept="image/*"
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={handleFileChange}
            showUploadList={false}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Hacé clic o arrastrá una imagen</p>
          </Upload.Dragger>
          {previewBase64 != null && (
            <img
              src={previewBase64}
              alt="Vista previa"
              style={{ marginTop: 8, maxHeight: 120, borderRadius: 4, display: 'block' }}
            />
          )}
        </div>
      ),
    },
    {
      key: 'url',
      label: 'Pegar URL',
      children: (
        <div>
          <Form.Item name="coverUrl" noStyle>
            <Input
              placeholder="https://..."
              onChange={handleUrlChange}
              aria-label="URL de portada"
            />
          </Form.Item>
          {typeof coverUrlPreview === 'string' && coverUrlPreview.startsWith('http') && (
            <img
              src={coverUrlPreview}
              alt="Vista previa"
              style={{ marginTop: 8, maxHeight: 120, borderRadius: 4, display: 'block' }}
            />
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <Form.Item
        label="Titulo"
        name="title"
        rules={[{ required: true, message: 'El titulo es obligatorio' }]}
      >
        <Input aria-label="Titulo" placeholder="Ej. The Legend of Zelda" />
      </Form.Item>

      <Form.Item
        label="Plataforma"
        name="platform"
        rules={[{ required: true, message: 'La plataforma es obligatoria' }]}
      >
        <Select aria-label="Plataforma">
          <Select.OptGroup label="Sega">
            <Select.Option value="sega-ms">Master System</Select.Option>
            <Select.Option value="sega-md">Mega Drive</Select.Option>
            <Select.Option value="sega-saturn">Saturn</Select.Option>
            <Select.Option value="sega-dc">Dreamcast</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Nintendo">
            <Select.Option value="nes">NES</Select.Option>
            <Select.Option value="snes">SNES</Select.Option>
            <Select.Option value="n64">Nintendo 64</Select.Option>
            <Select.Option value="gamecube">GameCube</Select.Option>
            <Select.Option value="wii">Wii</Select.Option>
            <Select.Option value="wiiu">Wii U</Select.Option>
            <Select.Option value="switch">Nintendo Switch</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Portátiles Nintendo">
            <Select.Option value="gameboy">Game Boy</Select.Option>
            <Select.Option value="gbc">Game Boy Color</Select.Option>
            <Select.Option value="gba">Game Boy Advance</Select.Option>
            <Select.Option value="nds">Nintendo DS</Select.Option>
            <Select.Option value="3ds">Nintendo 3DS</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="PlayStation">
            <Select.Option value="ps1">PlayStation 1</Select.Option>
            <Select.Option value="ps2">PlayStation 2</Select.Option>
            <Select.Option value="ps3">PlayStation 3</Select.Option>
            <Select.Option value="ps4">PlayStation 4</Select.Option>
            <Select.Option value="ps5">PlayStation 5</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Portátiles Sony">
            <Select.Option value="psp">PSP</Select.Option>
            <Select.Option value="psvita">PS Vita</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Microsoft">
            <Select.Option value="xbox">Xbox</Select.Option>
            <Select.Option value="xbox360">Xbox 360</Select.Option>
            <Select.Option value="xbone">Xbox One</Select.Option>
            <Select.Option value="xbsx">Xbox Series X/S</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="PC">
            <Select.Option value="pc">PC</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Commodore">
            <Select.Option value="c64">Commodore 64</Select.Option>
            <Select.Option value="amiga">Amiga</Select.Option>
          </Select.OptGroup>
          <Select.OptGroup label="Otra">
            <Select.Option value="other">Otra</Select.Option>
          </Select.OptGroup>
        </Select>
      </Form.Item>

      <Form.Item
        label="Estado"
        name="status"
        rules={[{ required: true, message: 'El estado es obligatorio' }]}
      >
        <Select aria-label="Estado" options={statusOptions} />
      </Form.Item>

      <Form.Item
        label="Genero"
        name="genre"
        rules={[{ required: true, message: 'El genero es obligatorio' }]}
      >
        <Input aria-label="Genero" placeholder="Ej. RPG" />
      </Form.Item>

      <Form.Item
        label="Anio"
        name="year"
        rules={[
          { required: true, message: 'El anio es obligatorio' },
          { type: 'number', min: 1970, max: 2100, message: 'El anio debe estar entre 1970 y 2100' },
        ]}
      >
        <InputNumber aria-label="Anio" style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Nota" name="rating">
        <InputNumber min={0} max={10} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item label="Notas" name="notes">
        <Input.TextArea rows={3} />
      </Form.Item>

      {/* Cover image section */}
      <Form.Item label="Portada">
        <Tabs
          activeKey={coverTab}
          onChange={(key) => setCoverTab(key as 'file' | 'url')}
          items={coverItems}
          size="small"
        />
      </Form.Item>

      {/* Pros / Cons */}
      <Form.Item label="Puntos positivos" name="pros">
        <Input.TextArea
          rows={3}
          placeholder="Un punto por línea"
          aria-label="Puntos positivos"
        />
      </Form.Item>

      <Form.Item label="Puntos negativos" name="cons">
        <Input.TextArea
          rows={3}
          placeholder="Un punto por línea"
          aria-label="Puntos negativos"
        />
      </Form.Item>
    </>
  )
}
