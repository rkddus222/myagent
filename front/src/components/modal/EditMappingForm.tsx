import { Mapping } from '@hooks/queries/useMappingQuery'

import CustomIcons from '@components/common/Icons'

import { Button, Label, Select, TextInput } from 'flowbite-react'
import { useState } from 'react'

function EditMappingForm({
  isCreate = false,
  data,
  onClose = () => {},
  handleUpdateMapping,
  handleDeleteMapping,
  handleAddMapping
}: {
  isCreate: boolean
  data?: Mapping
  onClose: () => void
  handleUpdateMapping: (mapping: Mapping) => void
  handleDeleteMapping: (idx: string) => void
  handleAddMapping?: (mapping: Mapping) => void
}) {
  const [form, setForm] = useState({
    original_title: isCreate ? '' : (data?.original_title ?? ''),
    replace_title: isCreate ? '' : (data?.replace_title ?? ''),
    type: isCreate ? 'text' : (data?.type ?? 'text'),
    align: isCreate ? 'left' : (data?.align ?? 'left')
  })

  const alignOptions = ['left', 'center', 'right']
  const typeOptions = [
    'text',
    'number',
    'decimal',
    'percentage',
    'cash',
    'date',
    'time',
    'datetime'
  ]

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isCreate) {
      handleAddMapping?.({ ...form, idx: '', reg_dtm: '' })
    } else {
      handleUpdateMapping({ ...form, idx: data?.idx ?? '', reg_dtm: '' })
    }
    onClose()
  }
  const handleDelete = (idx: string) => {
    handleDeleteMapping(idx)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
      <div>
        <Label htmlFor='original_title'>원본 제목</Label>
        <TextInput
          id='original_title'
          name='original_title'
          value={form.original_title}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor='replace_title'>변경 제목</Label>
        <TextInput
          id='replace_title'
          name='replace_title'
          value={form.replace_title}
          onChange={handleChange}
        />
      </div>

      <div>
        <Label htmlFor='type'>타입</Label>
        <Select id='type' name='type' value={form.type} onChange={handleChange}>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor='align'>정렬</Label>
        <Select
          id='align'
          name='align'
          value={form.align}
          onChange={handleChange}
        >
          {alignOptions.map((align) => (
            <option key={align} value={align}>
              {align}
            </option>
          ))}
        </Select>
      </div>

      <div className='flex w-full items-center justify-between mt-4'>
        {!isCreate && (
          <CustomIcons
            name='trash'
            className='cursor-pointer text-2xl text-red-500 hover:text-red-600 transition-colors'
            onClick={() => handleDelete(data?.idx ?? 'no_idx')}
          />
        )}
        <div className='flex gap-3 ml-auto'>
          <Button color='gray' onClick={onClose}>
            취소
          </Button>
          <Button type='submit' color='blue'>
            저장
          </Button>
        </div>
      </div>
    </form>
  )
}

export default EditMappingForm
