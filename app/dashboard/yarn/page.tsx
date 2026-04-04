'use client'

import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { generateId } from '@/lib/storage'
import type { YarnEntry } from '@/lib/types'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Weight } from 'lucide-react'
import { WeightModal } from '@/components/weight-modal'

export interface YarnTotalEntry {
  yarn_type: string
  yarn_sub_type: string
  total_weight: number
}

export default function YarnPage() {
  const { user } = useAuth()

  const [entries, setEntries] = useState<any[]>([])
  const [totalEntries, setTotalEntries] = useState<YarnTotalEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<YarnEntry | null>(null)
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    yarn_sub_type: '',
    total_weight: ''
  })

  const openYarnModal = () => {
  setYarnForm({
    yarn_type: '',
    yarn_sub_type: '',
    total_weight: '',
  })
  setIsYarnModalOpen(true)
}
  const [formState, setFormState] = useState({
    type: '',
    subType: '',
  })

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/yarn?company_id=${user?.company_id}`)
      const totalRes = await fetch(`/api/yarn?company_id=${user?.company_id}&action=total`)

      const json = await res.json()
      const totalJson = await totalRes.json()

      if (json.status) {
        const formatted = json.data
          .filter((item: any) => {
            // Only include items with positive weight
            const weight = parseFloat(item.weight);
            return !isNaN(weight) && weight > 0;
          })
          .map((item: any) => ({
            id: item.id,
            batchId: item.batch_id,
            supplierName: item.supplier_name,
            date: item.created_at?.split(' ')[0],
            quantity: parseFloat(item.weight),
            type: item.yarn_type,
            subType: item.yarn_sub_type
          }));

        setEntries(formatted);
      } else {
        setEntries(
          json.data.map((item: any) => ({
            id: item.id,
            batchId: item.batch_id,
            supplierName: item.supplier_name,
            date: item.created_at?.split(' ')[0],
            quantity: parseFloat(item.weight),
            type: item.yarn_type,
            subType: item.yarn_sub_type,
          }))
        )
      }

      if (totalJson.status) {
        setTotalEntries(totalJson.data)
      }
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getSubTypes = (type: string) =>
    totalEntries
      .filter(y => y.yarn_type === type)
      .map(y => y.yarn_sub_type)

  // ✅ ADD
  const handleAddNew = () => {
    setEditingEntry({
      id: '',
      batch_id: generateBatchId(),
      supplier_name: '',
      created_at: new Date().toISOString().split('T')[0],
      weight: '0',
      yarn_type: '',
      yarn_sub_type: '',
      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
    })

    setFormState({ type: '', subType: '' })
    setIsModalOpen(true)
  }

  // ✅ EDIT (FIXED)
  const handleEdit = (entry: any) => {
    setEditingEntry({
      id: entry.id,
      batch_id: entry.batchId,
      supplier_name: entry.supplierName,
      created_at: entry.date,
      weight: entry.quantity,
      yarn_type: entry.type,
      yarn_sub_type: entry.subType,
      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
    })

    setFormState({
      type: entry.type,
      subType: entry.subType,
    })

    setIsModalOpen(true)
  }


  const handleSubType = (sub: string) => {
    const yarn = totalEntries.find(
      y => y.yarn_type === yarnForm.yarn_type && y.yarn_sub_type === sub
    )

    setYarnForm({
      yarn_type: yarnForm.yarn_type,
      yarn_sub_type: sub,
      total_weight: yarn ? String(yarn.total_weight) : '',
    })
  }

  const handleYarnChange = (type: string) => {
    setYarnForm({
      yarn_type: type,
      yarn_sub_type: '',
      total_weight: '',
    })
  }

  const generateBatchId = () =>
    `BATCH-${Date.now().toString().slice(-5)}`

  const yarnTypes = useMemo(
    () => [...new Set(totalEntries.map(y => y.yarn_type))],
    [totalEntries]
  )


  const handleDelete = async (entry: YarnEntry) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    try {
      const res = await fetch(`/api/yarn?id=${entry.id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.status) {
        toast.success('Entry deleted successfully')
        loadEntries()
      } else {
        toast.error(json.message || 'Failed to delete entry')
      }
    } catch (error) {
      toast.error('Failed to delete entry')
    }
  }

  const subTypeOptions = useMemo(() => {
    return getSubTypes(yarnForm.yarn_type).map(s => ({
      value: s,
      label: s,
    }))
  }, [yarnForm.yarn_type, totalEntries])

  const handleSubmit = async (data: any) => {

    const formData: YarnEntry = {
      id: editingEntry?.id || '',
      batch_id: editingEntry?.batch_id || generateBatchId(),

      supplier_name: data.supplierName,
      created_at: data.date,
      weight: data.quantity,

      // ✅ FIX: USE data (NOT formState)
      yarn_type: data.type,
      yarn_sub_type: data.subType || data.type, // fallback

      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
    }

    console.log("FINAL DATA:", formData) // 🔥 DEBUG

    try {
      const res = await fetch('/api/yarn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (json.status) {
        toast.success(editingEntry?.id ? 'Updated' : 'Created')
        setIsModalOpen(false)
        loadEntries()
      } else {
        toast.error(json.message)
      }
    } catch {
      toast.error('Error saving')
    }
  }

  // ✅ DEPENDENT SUBTYPE


  const columns = [
    { key: 'batchId', label: 'Batch ID' },
    { key: 'date', label: 'Date' },
    { key: 'supplierName', label: 'Supplier Name' },
    { key: 'type', label: 'Type' },
    { key: 'subType', label: 'Sub Type' },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (v: number) => v.toFixed(2),
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className='row flex justify-between items-center'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Yarn Management</h1>
          <p className="text-muted-foreground">Track turns per minute and machine performance</p>
        </div>
        <Button onClick={openYarnModal}>
          <Weight size={16} /> Status Check
        </Button>

      </div>
      {/* <div className="p-6"> */}
      <DataTable
        title="Yarn Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        isLoading={loading}
        onDelete={handleDelete}
      />


      {/* Yarn Modal */}
      <WeightModal
        isOpen={isYarnModalOpen}
        title="Yarn Weight"
        fields={[
          {
            name: 'yarn_type',
            label: 'Type',
            type: 'select',
            options: yarnTypes.map(y => ({ value: y, label: y })),
            onChange: handleYarnChange,
          },
          {
            name: 'yarn_sub_type',
            label: 'Sub Type',
            type: 'select',
            options: subTypeOptions,
            onChange: handleSubType,
          },
          {
            name: 'total_weight',
            label: 'Total Weight',
            type: 'text',
            disabled: true,
          },
        ]}
        initialData={yarnForm}
        onSubmit={() => setIsYarnModalOpen(false)}
        onClose={() => setIsYarnModalOpen(false)}
      />

      <FormModal
        isOpen={isModalOpen}
        title="Yarn Entry"
        initialData={{
          ...editingEntry,
          batchId: editingEntry?.batch_id,
          supplierName: editingEntry?.supplier_name,
          date: editingEntry?.created_at,
          quantity: editingEntry?.weight,
        }}
        fields={[
          {
            name: 'batchId',
            label: 'Batch ID',
            type: 'text',
            disabled: true, // ✅ LOCKED
            readOnly: true,
          },
          {
            name: 'supplierName',
            label: 'Supplier Name',
            type: 'text',
            required: true,
          },
          {
            name: 'type',
            label: 'Type',
            type: 'select',

            options: [
              ...new Set(totalEntries.map((e) => e.yarn_type)),
            ].map((t) => ({ value: t, label: t })),
            onChange: (val: string) =>
              setFormState({ type: val, subType: '' }),
          },
          {
            name: 'subType',
            label: 'Sub Type',
            type: 'select',

            options: getSubTypes(formState.type).map((s) => ({
              value: s,
              label: s,
            })),
            onChange: (val: string) =>
              setFormState({ type: val, subType: '' }),
          },
          {
            name: 'quantity',
            label: 'Quantity',
            type: 'number',
            required: true,
          },
        ]}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
    // </div>
  )
}