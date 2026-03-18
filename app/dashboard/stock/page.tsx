'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { storage, generateId } from '@/lib/storage'
import type { StockEntry } from '@/lib/types'
import { toast } from 'sonner'

export default function StockPage() {
  const [entries, setEntries] = useState<StockEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<StockEntry | null>(null)

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const res = await fetch(`/api/stock?company_id=1`); // ⚠️ replace with user?.company_id
      const json = await res.json();

      if (json.status) {
        const formatted = json.data.map((item: any) => ({
          id: item.id,
          yarn_type: item.yarn_type,
          tpm: item.tpm,
          color: item.color,

          total_cones: item.total_cones,
          packed_cones: item.packed_cones,
          remaining_cones: item.remaining_cones,

          total_box: item.total_box, // ✅ FIX
          total_extra_pis: item.total_extra_pis,
        }));
        setEntries(formatted);
      } else {
        console.error(json.message);
      }
    } catch (error) {
      console.error("Error loading stock:", error);
    }
  };

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
      id: editingEntry ? editingEntry.id : "",
      yarn_type: data.yarn_type || '',
      tpm: data.tpm || '',
      color: data.color || '',
      dyeing_weight: (data.dyeing_weight) || '',
      coning_weight: (data.coning_weight) || '',
      remaining_weight: (data.remaining_weight) || '',
      packed_cones: (data.packed_cones) || '',
      total_cones: (data.total_cones) || '',
      remaining_cones: (data.remaining_cones) || '',
      total_box: (data.total_box) || '',
      total_extra_pis: (data.total_extra_pis) || '',
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
    { key: 'tpm', label: 'TPM' },
    { key: 'color', label: 'Color' },
    { key: 'total_cones', label: 'Total Cones' },
    { key: 'packed_cones', label: 'Packed Cones' },
    { key: 'total_box', label: 'Total Boxes' }, // ✅ FIX
    { key: 'total_extra_pis', label: 'Total Extra PIs' },
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
          { name: 'total_extra_pis', label: 'Extra PIs', type: 'number' },
        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
