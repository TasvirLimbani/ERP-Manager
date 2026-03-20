




'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { generateId } from '@/lib/storage'
import type { YarnEntry, } from '@/lib/types'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Weight } from 'lucide-react'
import { WeightModal } from '@/components/weight-modal'

export interface YarnTotalEntry {
  yarn_type: string
  total_weight: string
}
export default function YarnPage() {
  const [entries, setEntries] = useState<YarnEntry[]>([])
  const [totalEntries, setTotalEntries] = useState<YarnTotalEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<YarnEntry | null>(null)
  const { user } = useAuth()
   const [loading, setLoading] = useState(false)
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    total_weight: ''
  })
  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
      setLoading(true)
    try {
      const res = await fetch(`/api/yarn?company_id=${user?.company_id}`)
      const response = await fetch(`/api/yarn?company_id=${user?.company_id}&action=total`)

      const json = await res.json()
      const totalJson = await response.json()
      if (json.status) {

        const totalFormatted = totalJson.data.map((item: any) => ({
          yarn_type: item.yarn_type,
          total_weight: parseFloat(item.total_weight),
        }))

        setTotalEntries(totalFormatted)

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
          }));

        setEntries(formatted);
      } else {

      }
    } catch (error) {
      toast.error('Failed to load yarn list')
    }
    finally {
    setLoading(false) // ✅ stop loading ALWAYS
  }
  }

  const handleAddNew = () => {
    setEditingEntry({
      id: '',
      batch_id: generateBatchId(),
      supplier_name: '',
      created_at: new Date().toISOString().split('T')[0],
      weight: '0',
      yarn_type: '',
      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
    })
    setIsModalOpen(true)
  }

  const handleEdit = (entry: YarnEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

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

  const handleYarn = () => {

    setYarnForm({
      yarn_type: '',
      total_weight: ''
    })
    setIsYarnModalOpen(true)
  }
  const handleYarnChange = (value: string) => {
    const yarn = totalEntries.find((y) => y.yarn_type === value)

    setYarnForm({
      yarn_type: value,
      total_weight: yarn ? String(yarn.total_weight) : ''
    })
  }
  const generateBatchId = () => {
    const now = new Date();
    const microPart = now.getTime().toString().slice(-5); // last 5 digits of timestamp in ms
    const batchId = `BATCH-${microPart}`;

    console.log(batchId); // e.g., BATCH-54321

    return batchId  // e.g., 173045
  }
  const handleSubmit = async (data: Record<string, any>) => {
    const formData: YarnEntry = {
      id: editingEntry?.id || '',
      batch_id: editingEntry?.batch_id || generateBatchId(),
      supplier_name: data.supplierName || '',
      created_at: data.date || new Date().toISOString().split('T')[0],
      weight: data.quantity || '0',
      yarn_type: data.type || '',
      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
    }

    try {
      const res = await fetch('/api/yarn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const json = await res.json()
      if (json.status) {
        toast.success(editingEntry ? 'Entry updated successfully' : 'Entry added successfully')
        setIsModalOpen(false)
        loadEntries()
      } else {
        toast.error(json.message || 'Failed to save entry')
      }
    } catch (error) {
      toast.error('Failed to save entry')
    }
  }

  const columns = [
    { key: 'batchId', label: 'Batch ID' },
    { key: 'date', label: 'Date' },
    { key: 'supplierName', label: 'Supplier Name' },
    { key: 'type', label: 'Type' },
    {
      key: 'quantity',
      label: 'Quantity (kg)',
      render: (value: number) => value.toFixed(2),
    },
  ]
const TableShimmer = () => {
  return (
    <div className="border rounded-lg p-4 space-y-4 animate-pulse bg-background">
      
      {/* Top Bar (Title + Add Button) */}
      <div className="flex justify-between items-center">
        <div className="h-6 w-48 bg-gray-300 rounded"></div>
        <div className="h-9 w-32 bg-gray-300 rounded"></div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-5 gap-4 border-t pt-4">
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
        <div className="h-8 w-32 bg-gray-300 rounded"></div>
        <div className="h-8 w-20 bg-gray-300 rounded"></div>
        <div className="h-8 w-24 bg-gray-300 rounded"></div>
      </div>

      {/* Rows */}
      {[...Array(6)].map((_, row) => (
        <div key={row} className="grid grid-cols-5 gap-4 items-center mt-15">
          <div className="h-7 w-24 bg-gray-200 rounded"></div>
          <div className="h-7 w-24 bg-gray-200 rounded"></div>
          <div className="h-7 w-32 bg-gray-200 rounded"></div>
          <div className="h-7 w-20 bg-gray-200 rounded"></div>
          <div className="h-7 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  )
}
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className='row flex justify-between items-center'>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Yarn Management</h1>
          <p className="text-muted-foreground">Track yarn inventory and details</p>
        </div>
        <Button
          onClick={handleYarn}
          className="bg-primary/80 hover:bg-primary/60 text-primary-foreground gap-2"
        >
          <Weight size={16} />
          Status check
        </Button>

      </div>
{loading ? (
  <TableShimmer />
) : (
      <DataTable
        title="Yarn Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
         isLoading={loading}
        emptyState="No yarn entries yet. Click 'Add New' to create one."
      />
      )}
      <WeightModal
        isOpen={isYarnModalOpen}
        title={'Yarn Weight'}
        fields={[
          {

            name: 'yarn_type',
            label: 'Type',
            type: 'select',
            placeholder: 'Select yarn type',
            required: true,
            onChange: handleYarnChange,
            options: [
              ...totalEntries.map((entry) => ({
                value: entry.yarn_type,
                label: entry.yarn_type,
              })),
            ],

          },
          {
            name: 'total_weight',
            label: 'Total Weight',
            type: 'text',
            // value: selectedYarnWeight,
            placeholder: '0.00 KG',
            readOnly: true,
            disabled: true
          }
        ]}
        initialData={yarnForm}
        onSubmit={() => setIsYarnModalOpen(false)}
        onClose={() => setIsYarnModalOpen(false)}
      />
      <FormModal
        isOpen={isModalOpen}
        title={editingEntry ? 'Edit Yarn Entry' : 'Add New Yarn'}
        fields={[
          { name: 'batch_id', label: 'Batch ID', type: 'text', placeholder: 'Auto Generated', readOnly: true, disabled: true },
          { name: 'supplierName', label: 'Supplier Name', type: 'text', placeholder: 'Enter supplier name', required: true },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            placeholder: 'Select yarn type',
            required: true,
            options: [
              ...totalEntries.map((entry) => ({
                value: entry.yarn_type,
                label: entry.yarn_type,
              })),
            ],

          },
          { name: 'quantity', label: 'Quantity (kg)', type: 'number', placeholder: '0.00', required: true },
        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}














