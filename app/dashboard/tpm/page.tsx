'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { WeightModal } from '@/components/weight-modal'
import { Button } from '@/components/ui/button'
import { Weight } from 'lucide-react'

type TPMEntry = {
  id: string
  company_id: string
  admin_id: string
  machine_no: string
  batch_id: string
  yarn_type: string
  tpm: string
  input_weight: string
  output_weight: string
  weight_gap: string
  created_at: string
}

export interface YarnTotalEntry {
  yarn_type: string
  total_weight: string
}
export default function TPMPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<TPMEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [totalEntries, setTotalEntries] = useState<YarnTotalEntry[]>([])
  const [editingEntry, setEditingEntry] = useState<TPMEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    total_weight: ''
  })


  type Machine = {
    id: string
    machine_number: string
  }
  const [machines, setMachines] = useState<Machine[]>([])

  useEffect(() => {
    loadEntries()
    loadMachines()
  }, [user?.company_id])

  const loadEntries = async () => {
    if (!user?.company_id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/tpm?company_id=${user?.company_id}`)
      const response = await fetch(`/api/yarn?company_id=${user?.company_id}&action=total`)

      const json = await res.json()
      const totalJson = await response.json()
      if (json.status) {

        const totalFormatted = totalJson.data.map((item: any) => ({
          yarn_type: item.yarn_type,
          total_weight: parseFloat(item.total_weight),
        }))

        setTotalEntries(totalFormatted)
        const formatted = json.data.map((item: any) => ({
          id: item.id,
          company_id: item.company_id,
          admin_id: item.admin_id,
          machine_no: item.machine_no,
          batch_id: item.batch_id,
          yarn_type: item.yarn_type,
          tpm: item.tpm,
          input_weight: item.input_weight,
          output_weight: item.output_weight,
          weight_gap: item.weight_gap,
          created_at: item.created_at.split(' ')[0], // Format date to YYYY-MM-DD
        }))
        setEntries(formatted)
      } else {
        toast.error(json.message || 'Failed to load TPM entries')
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load TPM entries')
    } finally {
      setLoading(false)
    }
  }


  const loadMachines = async () => {
    if (!user?.company_id) return

    try {
      const res = await fetch(
        `/api/machines?company_id=${user.company_id}&machine_type=Twisting Machine`
      )

      const json = await res.json()

      if (json.status) {
        const formatted = json.data.map((item: any) => ({
          id: String(item.id),
          machine_number: String(item.machine_number),
        }))

        setMachines(formatted)
      } else {
        toast.error(json.message || "Failed to load machines")
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }
  const handleAddNew = () => {
    setEditingEntry({
      id: '',
      batch_id: generateBatchId(),
      created_at: new Date().toISOString().split('T')[0],
      company_id: user?.company_id?.toString() || '',
      admin_id: user?.id?.toString() || '',
      machine_no: '',
      yarn_type: '',
      tpm: '',
      input_weight: '',
      output_weight: '',
      weight_gap: '',
    })

    setIsModalOpen(true)
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

  const handleEdit = (entry: TPMEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDelete = async (entry: TPMEntry) => {

    if (!confirm("Are you sure you want to delete this entry?")) return

    try {

      const res = await fetch(`/api/tpm?id=${entry.id}`, {
        method: 'DELETE',
      })

      const json = await res.json()

      if (json.status) {

        toast.success("Entry deleted successfully")
        loadEntries()

      } else {

        toast.error(json.message)

      }

    } catch (error: any) {

      toast.error(error.message)

    }

  }

  const generateBatchId = () => {
    const now = new Date();
    const microPart = now.getTime().toString().slice(-5); // last 5 digits of timestamp in ms
    const batchId = `BATCH-${microPart}`;

    console.log(batchId); // e.g., BATCH-54321

    return batchId  // e.g., 173045
  }


  const handleSubmit = async (data: Record<string, any>) => {
    try {
      console.log("Yarn Type in TPM form:", data.yarn_type); // Debug log for yarn type
      const formData: TPMEntry = {
        id: editingEntry ? editingEntry.id : "",
        tpm: data.tpm || "0",
        yarn_type:  data.yarn_type || "",
        input_weight: data.input_weight || "0",
        output_weight: data.output_weight || "0",
        weight_gap: data.weight_gap || "0",
        machine_no: data.machine_no || "",
        batch_id: data.batch_id || "",
        created_at: editingEntry
          ? editingEntry.created_at
          : new Date().toISOString().split("T")[0],

        company_id: user?.company_id.toString() || "",
        admin_id: user?.id.toString() || "",
      }

      const res = await fetch("/api/tpm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const json = await res.json()

      if (json.status) {
        toast.success(`Entry ${editingEntry ? "updated" : "added"} successfully`)
        setIsModalOpen(false)
        loadEntries()
        setEditingEntry(null)
      } else {
        toast.error(json.message || "Failed to save entry")
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to save entry")
    }
  }

  const columns = [
    { key: 'created_at', label: 'Date' },
    {
      key: 'machine_no',
      label: 'Machine ID',
      render: (value: string) => {
        const machine = machines.find((m) => m.id === value)
        return machine ? `M-${machine.machine_number}` : value
      },
    },
    {
      key: 'tpm',
      label: 'TPM',
      render: (value: number) => `${Number(value).toFixed(0)} rpm`,
    },
    { key: 'yarn_type', label: 'Yarn Type' },
    { key: 'input_weight', label: 'Input Weight' },
    { key: 'output_weight', label: 'Output Weight' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className='row flex justify-between items-center'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">TPM Management</h1>
          <p className="text-muted-foreground">Track turns per minute and machine performance</p>
        </div>
        <Button
          onClick={handleYarn}
          className="bg-primary/80 hover:bg-primary/60 text-primary-foreground gap-2"
        >
          <Weight size={16} />
          Status check
        </Button>

      </div>


      <DataTable
        title="TPM Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}   // ✅ loading state
        emptyState="No TPM entries yet. Click 'Add New' to create one."
      />
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
        title={editingEntry ? 'Edit TPM Entry' : 'Add New TPM Entry'}



        fields={[

          { name: 'batch_id', label: 'Batch ID', type: 'text', placeholder: 'Auto Generated', readOnly: true, disabled: true },
          {
            name: 'machine_no',
            label: 'Machine ID',
            type: 'select',
            placeholder: 'Select Machine',
            required: true,
            options: machines.map((m) => ({
              value: m.id,
              label: `M-${m.machine_number}`,
            })),
          },
          { name: 'tpm', label: 'TPM (Turns/Min)', type: 'number', placeholder: '0.00', required: true },
          {
            name: 'yarn_type',
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
          { name: 'input_weight', label: 'Input Weight', type: 'number', placeholder: '0.00', required: true },
          { name: 'output_weight', label: 'Output Weight', type: 'number', placeholder: '0.00', required: true },
        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}



