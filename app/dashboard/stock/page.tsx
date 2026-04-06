'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { storage, generateId } from '@/lib/storage'
import type { StockEntry } from '@/lib/types'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

export default function StockPage() {
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loding, setLoading] = useState(false)
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stock?company_id=${user?.company_id}`)
      const json = await res.json()

      if (json.status) {
        const formatted: StockEntry[] = json.data.map((item: any) => ({
          id: item.id,
          yarn_type: item.yarn_type,
          tpm: item.tpm,
          color: item.color,
          category: item.category || '',

          unpacked_cones:
            typeof item.unpacked_cones === 'string'
              ? JSON.parse(item.unpacked_cones)
              : item.unpacked_cones || [],

          packed_cones_size:
            typeof item.packed_cones_size === 'string'
              ? JSON.parse(item.packed_cones_size)
              : item.packed_cones_size || [],
        }))

        setEntries(formatted)
      }
    } catch (error) {
      console.error('Error loading stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddNew = () => {
    setEditingEntry(null)
    setIsModalOpen(true)
  }

  const handleEdit = (entry: StockEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDelete = (entry: StockEntry) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      storage.stock.delete(entry.id)
      toast.success('Entry deleted successfully')
      loadEntries()
    }
  }


  const handleSubmit = (data: Record<string, any>) => {
    const formData: StockEntry = {
      id: editingEntry ? editingEntry.id : '',
      yarn_type: data.yarn_type || '',
      tpm: data.tpm || '',
      color: data.color || '',
      category: data.category || '',
      unpacked_cones: data.unpacked_cones || [],
      packed_cones_size: data.packed_cones_size || [],
    }

    if (editingEntry) {
      storage.stock.update(editingEntry.id, formData)
      toast.success('Entry updated successfully')
    } else {
      storage.stock.add(formData)
      toast.success('Entry added successfully')
    }

    setIsModalOpen(false)
    loadEntries()
  }
  const columns = [
    { key: 'yarn_type', label: 'Yarn Type' },
    // { key: 'tpm', label: 'TPM' },
    { key: 'category', label: 'Category' },
    { key: 'color', label: 'Color' },

    {
      key: 'unpacked',
      label: 'Unpacked Cones',
      render: (_: any, row: any) => {
        const unpacked = row?.unpacked_cones || []

        return unpacked.length === 0 ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <div className="space-y-1">
            {unpacked.map((c: any, i: number) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{c.cone_size}</span>
                <span className="mx-1">→</span>
                <span>{c.cones}</span>
              </div>
            ))}
          </div>
        )
      },
    },

    {
      key: 'packed',
      label: 'Packed Box',
      render: (_: any, row: any) => {
        let packed = row?.packed_cones_size

        if (!packed) packed = []

        if (typeof packed === 'string') {
          try {
            packed = JSON.parse(packed)
          } catch {
            packed = []
          }
        }

        if (!Array.isArray(packed)) {
          packed = []
        }

        return packed.length === 0 ? (
          <span className="text-muted-foreground">-</span>
        ) : (
          <div className="space-y-1">
            {packed.map((c: any, i: number) => (
              <div key={i} className="text-sm">
                <span className="font-medium">{c.cone_size}</span>
                <span className="mx-1">→</span>
                <span>{c.box} box </span>
              </div>
            ))}
          </div>
        )
      },
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Stock Management</h1>
        <p className="text-muted-foreground">Track inventory and stock levels</p>
      </div>

      <DataTable
        title="Stock Entries"
        columns={columns}
        data={entries}
        isLoading={loding}
        emptyState="No stock entries yet. Click 'Add New' to create one."
      />

      <FormModal
        isOpen={isModalOpen}
        title={editingEntry ? 'Edit Stock Entry' : 'Add New Stock Entry'}

        fields={[
          { name: 'yarn_type', label: 'Yarn Type', type: 'text', required: true },
          { name: 'tpm', label: 'TPM', type: 'number', required: true },
          { name: 'color', label: 'Color', type: 'text', required: true },
          { name: 'total_cones', label: 'Total Cones', type: 'number' },
          { name: 'packed_cones', label: 'Packed Cones', type: 'number' },
          { name: 'remaining_cones', label: 'Remaining Cones', type: 'number' },
          { name: 'total_boxes', label: 'Total Boxes', type: 'number' },
         
        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}