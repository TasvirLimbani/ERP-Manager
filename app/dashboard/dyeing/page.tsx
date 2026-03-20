'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { storage, generateId } from '@/lib/storage'
import type { DyeingEntry } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'
import { WeightModal } from '@/components/weight-modal'
import { Button } from '@/components/ui/button'
import { Weight } from 'lucide-react'


export interface DyeingTotalEntry {
  tpm: string
  yarn_type: string
  color: string
  total_output_weight: number
}

export default function DyeingPage() {
  const [entries, setEntries] = useState<DyeingEntry[]>([])
  const [totalEntries, setTotalEntries] = useState<DyeingTotalEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DyeingEntry | null>(null)
  const [selectedYarn, setSelectedYarn] = useState<string>("")
  const [selectedTpm, setSelectedTpm] = useState<string>("")
  const [selectedYarnWeight, setSelectedYarnWeight] = useState<string>("")
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const { user } = useAuth()
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    tpm: '',
    total_output_weight: ''
  })


  type Machine = {
    id: string
    machine_number: string
  }
  const [machines, setMachines] = useState<Machine[]>([])

  useEffect(() => {
    if (user?.company_id) {
      loadEntries()
      loadMachines()
    }
  }, [user])

  const loadEntries = async () => {
    if (!user?.company_id) return

    setLoading(true)

    try {
      const res = await fetch(`/api/dyeing?company_id=${user.company_id}`)
      const response = await fetch(`/api/tpm?company_id=${user.company_id}&action=total`)  // ✅ ADD THIS LINE
      const json = await res.json()
      const totalJson = await response.json()

      if (totalJson.status) {
        const formatted = totalJson.data.map((item: DyeingTotalEntry) => ({
          tpm: item.tpm,
          yarn_type: item.yarn_type,
          total_output_weight: parseFloat(item.total_output_weight.toString()),
        }))


        setTotalEntries(formatted)
      }


      if (json.status) {

        // dyeing entries
        const formatted = json.data.map((item: any) => ({
          id: item.id,
          company_id: item.company_id,
          admin_id: item.admin_id,
          machine_id: item.machine_id,
          yarn_type: item.yarn_type,
          tpm: item.tpm,
          weight: item.weight,
          output_weight: item.output_weight,
          color: item.color,
          status: item.status,
          created_at: item.created_at?.split(' ')[0],
        }))

        setEntries(formatted)

      } else {
        toast.error(json.message || "Failed to load dyeing entries")
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to load dyeing entries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("Total Entries Updated::::: ", totalEntries) // Debug log to check total entries update
  }, [totalEntries])

  const handleAddNew = () => {
    setSelectedYarn("")
    setSelectedTpm("")
    setSelectedYarnWeight("")

    setEditingEntry({
      id: '',
      machine_id: '',
      yarn_type: '',
      color: '',
      output_weight: '',
      status: 'running',
      created_at: new Date().toISOString().split('T')[0],
      tpm: '',
      weight: '',
      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
    })
    setIsModalOpen(true)
  }



  const loadMachines = async () => {
    if (!user?.company_id) return

    try {
      const res = await fetch(
        `/api/machines?company_id=${user.company_id}&machine_type=Dyeing Machine`
      )

      const json = await res.json()

      if (json.status) {
        const formatted = json.data.map((item: any) => ({
          // id: String(item.id),
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


  const handleYarn = () => {
    setYarnForm({
      yarn_type: '',
      tpm: '',
      total_output_weight: ''
    })
    setSelectedYarn("")
    setSelectedTpm("")
    setSelectedYarnWeight("") // reset weight when opening modal
    setIsYarnModalOpen(true)
  }
  const handleEdit = (entry: DyeingEntry) => {
    setEditingEntry(entry)

    // ✅ set all selected states from entry
    setSelectedYarn(entry.yarn_type || "")
    setSelectedTpm(String(entry.tpm) || "")
    setSelectedMachine(entry.machine_id || "")

    console.log("Editing Entry::::::::::::::: :", entry.machine_id) // check in console

    setIsModalOpen(true)
  }
  const handleDelete = async (entry: DyeingEntry) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    console.log("Deleting ID:", entry.id) // check in console

    const res = await fetch(`/api/dyeing?id=${entry.id}`, {
      method: "DELETE",
    })

    const json = await res.json()

    if (json.status) {
      toast.success("Entry deleted successfully")
      loadEntries()
    } else {
      toast.error(json.message || "Failed to delete entry")
    }
  }



  // const handleSubmit = async (data: Record<string, any>) => {
  //   console.log("Form Data Submitted ::::::::::::::::: ", data) // Debug log to check form data
  //   try {
  //     const formData: DyeingEntry = {
  //       id: editingEntry ? editingEntry.id : "",
  //       yarn_type: selectedYarn || data.yarn_type || "",
  //       tpm: Number(selectedTpm) || Number(data.tpm) || 0,
  //       output_weight: Number(data.output_weight) || 0,
  //       created_at: editingEntry
  //         ? editingEntry.created_at
  //         : new Date().toISOString().split("T")[0],
  //       color: data.color || '',
  //       weight: Number(data.weight) || 0,
  //       machine_id: selectedMachine || data.machine_id || '',
  //       company_id: String(user?.company_id || ''),
  //       admin_id: String(user?.id || ''),
  //       status: editingEntry?.status || "running",

  //     }

  //     const res = await fetch("/api/dyeing", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(formData),
  //     })

  //     const json = await res.json()

  //     if (json.status) {
  //       toast.success(`Entry ${editingEntry ? "updated" : "added"} successfully`)
  //       setIsModalOpen(false)
  //       loadEntries()
  //       setEditingEntry(null)
  //     } else {
  //       toast.error(json.message || "Failed to save entry")
  //     }

  //   } catch (error: any) {
  //     toast.error(error.message || "Failed to save entry")
  //   }
  // }


  const handleSubmit = async (data: Record<string, any>) => {
  try {
    const formData: DyeingEntry = {
      id: editingEntry?.id || "",
      yarn_type: selectedYarn || data.yarn_type,
      tpm: Number(selectedTpm || data.tpm),
      output_weight: Number(data.output_weight),
      created_at: editingEntry?.created_at || new Date().toISOString().split("T")[0],
      color: data.color,
      weight: Number(data.weight),
      machine_id: selectedMachine || data.machine_id,
      company_id: String(user?.company_id || ''),
      admin_id: String(user?.id || ''),
      status: data.status || editingEntry?.status || "running",
    }

    console.log("FINAL API DATA:", formData) // 🔍 DEBUG

    const res = await fetch("/api/dyeing", {
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

      // ✅ reset states
      setSelectedYarn("")
      setSelectedTpm("")
      setSelectedMachine("")
    } else {
      toast.error(json.message || "Failed to save entry")
    }

  } catch (error: any) {
    toast.error(error.message || "Failed to save entry")
  }
}

  // const handleSubmit = async (data: Record<string, any>) => {

  //   console.log("Yarn Type ::::::::::::::::: ", selectedYarn) // Debug log to check form data
  //   console.log("TPM Type ::::::::::::::::: ", selectedTpm) // Debug log to check form data
  //   try {
  //     const isEdit = !!editingEntry?.id

  //     const formData: DyeingEntry = {
  //       id: editingEntry ? editingEntry.id : "",
  //       tpm: data.tpm || selectedTpm || "0",
  //       yarn_type: editingEntry?.yarn_type || data.yarn_type || selectedYarn || "",
  //       output_weight: data.output_weight || "0",
  //       created_at: editingEntry
  //         ? editingEntry.created_at
  //         : new Date().toISOString().split("T")[0],
  //       color: data.color || '',
  //       weight: data.weight || '0',
  //       machine_id: data.machine_id || '',
  //       company_id: String(user?.company_id || ''),
  //       admin_id: String(user?.id || ''),
  //       status: data.status || "running",
  //     }
  //     // ✅ ONLY status changed → call changestatus API
  //     if (isEdit && editingEntry?.status !== data.status) {
  //       const res = await fetch("/api/dyeing", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           action: "change_status",
  //           id: editingEntry.id,
  //           status: data.status,
  //         }),
  //       })
  //     } else {
  //       // ✅ normal add/update
  //      const res = await fetch("/api/dyeing", {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(formData),
  //       })
  //     }

  //     const json = await res.json()

  //     if (json.status) {
  //       toast.success(`Entry ${isEdit ? "updated" : "added"} successfully`)
  //       setIsModalOpen(false)
  //       loadEntries()
  //       setEditingEntry(null)
  //     } else {
  //       toast.error(json.message || "Failed to save entry")
  //     }

  //   } catch (error: any) {
  //     toast.error(error.message || "Failed to save entry")
  //   }
  // }

  const handleYarnChange = (value: string) => {
    setSelectedYarn(value)
    setYarnForm((prev) => ({
      ...prev,
      yarn_type: value
    }))
    setSelectedTpm("")
    setSelectedYarnWeight("")
  }
  const handleMachineChange = (value: string) => {
    setSelectedMachine(value)
  }
  const handleTpmChange = (value: string) => {
    setSelectedTpm(value)
    setYarnForm((prev) => ({
      ...prev,
      tpm: value
    }))
    const yarn = totalEntries.find(
      (y) => y.yarn_type === selectedYarn && y.tpm === value
    )

    if (yarn) {

      setYarnForm({
        yarn_type: yarn.yarn_type,
        tpm: yarn.tpm,
        total_output_weight: yarn.total_output_weight.toString()
      })
      setSelectedYarnWeight(yarn.total_output_weight.toString())
    } else {
      setSelectedYarnWeight("")
    }
  }



  const columns = [
    { key: 'created_at', label: 'Date' },
    // { key: 'machine_id', label: 'Machine ID' },
    { key: 'tpm', label: 'TMP' },
    { key: 'yarn_type', label: 'Yarn Type' },
    { key: 'weight', label: 'Weight (kg)' },
    { key: 'output_weight', label: 'Output Weight (kg)' },
    { key: 'color', label: 'Dye Color' },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => {
        const statusColors: Record<string, string> = {
          pending: 'bg-blue-500',
          running: 'bg-yellow-500',
          completed: 'bg-green-700',
          cancelled: 'bg-red-500',
        }

        return (
          <div className="flex justify-center">
            <span
              className={`h-3 w-3 bg-blue-500 rounded ${statusColors[value] || 'bg-gray-400'}`}
            ></span>
          </div>
        )
      },
    }

  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className='row flex justify-between items-center'>
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-foreground mb-2">Dyeing Management</h1>
          <p className="text-muted-foreground">Manage dyeing batches and colors</p>

          <div className='row flex items-center mt-4 text-sm text-foreground'>
            <div className="h-3 w-3 bg-blue-500 rounded">
            </div>
            <span className="ml-2">Pending</span>
            <div className="ml-2 h-3 w-3 bg-yellow-500 rounded">
            </div>
            <span className="ml-2">Running</span>

            <div className="ml-2 h-3 w-3 bg-green-700 rounded">
            </div>
            <span className="ml-2">Completed</span>
            <div className="ml-2 h-3 w-3 bg-red-500 rounded">
            </div>
            <span className="ml-2">Cancelled</span>
          </div>

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
        title="Dyeing Entries"

        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
        emptyState="No dyeing entries yet. Click 'Add New' to create one."
      />


      <WeightModal
        isOpen={isYarnModalOpen}
        title={'Yarn Weight'}
        fields={[
          {
            name: 'yarn_type',
            label: 'Type',
            value: yarnForm.yarn_type,
            type: 'select',
            placeholder: 'Select yarn type',
            onChange: handleYarnChange,
            options: [...new Set(totalEntries.map(item => item.yarn_type))].map(yarn => ({
              value: yarn,
              label: yarn
            }))
          },
          {
            name: 'tpm',
            label: 'TPM',
            type: 'select',
            value: yarnForm.tpm,
            placeholder: 'Select TPM',
            onChange: handleTpmChange,
            options: totalEntries
              .filter(e => !selectedYarn || e.yarn_type === selectedYarn)
              .map(e => ({
                value: e.tpm,
                label: e.tpm
              }))
          },
          {
            name: 'total_output_weight',
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
        title={editingEntry ? 'Edit Dyeing Entry' : 'Add New Dyeing Entry'}

        fields={[

          {
            name: 'machine_id',
            label: 'Machine ID',
            type: 'select',
            placeholder: 'Select Machine',
            value: selectedMachine || editingEntry?.machine_id,
                        required: true,
            onChange: handleMachineChange,
            options: machines.map((m) => ({
              value: m.id,
              label: `${m.machine_number}`,
            })),
          },

          {
            name: 'yarn_type',
            label: 'Type',
            value: selectedYarn || editingEntry?.yarn_type,
            type: 'select',
            placeholder: 'Select yarn type',
            onChange: handleYarnChange,
            options: [...new Set(totalEntries.map(item => item.yarn_type))].map(yarn => ({
              value: yarn,
              label: yarn
            }))
          },
          {
            name: 'tpm',
            label: 'TPM',
            type: 'select',
            value: selectedTpm || editingEntry?.tpm,
            placeholder: 'Select TPM',
            onChange: handleTpmChange,
            options: totalEntries
              .filter(e => !selectedYarn || e.yarn_type === selectedYarn)
              .map(e => ({
                value: e.tpm,
                label: e.tpm
              }))
          },
          // { name: 'tpm', label: 'TPM', type: 'number', placeholder: '0', required: true },
          // {
          //   name: 'yarn_type',
          //   label: 'Type',
          //   type: 'select',
          //   placeholder: 'Select yarn type',
          //   required: true,
          //   options: [
          //     ...totalEntries.map((entry) => ({
          //       value: entry.yarn_type,
          //       label: entry.yarn_type,
          //     })),
          //   ],

          // },
          { name: 'weight', label: 'Weight (kg)', type: 'number', placeholder: '0.00', required: true },
          { name: 'color', label: 'Dye Color', type: 'text', placeholder: 'e.g., Deep Blue', required: true },
          { name: 'output_weight', label: 'Output Weight (kg)', type: 'number', placeholder: '0.00', required: true },
          {
            name: 'status', label: 'Status', type: 'select', placeholder: 'Select status', required: true, options: [
              { value: 'running', label: 'Running' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]
          },

        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedYarn("")
          setSelectedTpm("")
          setSelectedYarnWeight("")
        }}
      />
    </div>
  )
}
