'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { storage, generateId } from '@/lib/storage'
import type { ConningEntry } from '@/lib/types'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'
import { DyeingTotalEntry } from '../dyeing/page'
import { Weight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WeightModal } from '@/components/weight-modal'

export interface ConingTotalEntry {
  tpm: string
  yarn_type: string
  color: string
  category: string
  total_output_weight: number
}


export default function ConningPage() {
  const [entries, setEntries] = useState<ConningEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [totalEntries, setTotalEntries] = useState<DyeingTotalEntry[]>([])
  const [selectedYarn, setSelectedYarn] = useState<string>("")
  const [selectedTpm, setSelectedTpm] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [editingEntry, setEditingEntry] = useState<ConningEntry | null>(null)
  const [selectedYarnWeight, setSelectedYarnWeight] = useState<string>("")
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const { user } = useAuth()
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    tpm: '',
    color: '',
    category: '',
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
      const res = await fetch(`/api/conning?company_id=${user.company_id}`)
      const response = await fetch(`/api/dyeing?company_id=${user.company_id}&action=total`)  // 
      const json = await res.json()
      const totalJson = await response.json()

      if (totalJson.status) {
        const formatted = totalJson.data.map((item: ConingTotalEntry) => ({
          tpm: String(item.tpm),
          color: String(item.color),
          yarn_type: String(item.yarn_type),
          category: String(item.category),
          total_output_weight: item.total_output_weight,
        }))


        setTotalEntries(formatted)
      }
      if (json.status) {

        const formatted = json.data.map((item: any) => ({
          id: item.id,
          company_id: item.company_id,
          machine_id: item.machine_id,
          yarn_type: item.yarn_type,
          tpm: item.tpm,
          color: item.color,
          category: item.category,
          weight: item.weight,
          cones: item.cones,
          cones_size: item.cones_size,
          dyeing_total_weight: item.dyeing_total_weight,
          coning_total_weight: item.coning_total_weight,
          remaining_weight: item.remaining_weight,
          created_at: item.created_at?.split(" ")[0],
        }))
        setEntries(formatted)

      } else {
        toast.error(json.message || "Failed to load coning entries")
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to load coning entries")
    } finally {
      setLoading(false)
    }
  }



  const loadMachines = async () => {
    if (!user?.company_id) return

    try {
      const res = await fetch(
        `/api/machines?company_id=${user.company_id}&machine_type=Automatic Cone`
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
    setSelectedYarn("")
    setSelectedTpm("")
    setSelectedColor("")

    setEditingEntry({
      id: "",
      company_id: String(user?.company_id || ""),
      machine_id: "",
      yarn_type: "",
      category: "",
      tpm: "",
      color: "",
      weight: "",
      cones: "",
      cones_size: "",
      date: new Date().toISOString().split("T")[0],
    })
    setEditingEntry(null)
    setIsModalOpen(true)
  }


  const handleYarn = () => {
    setYarnForm({
      yarn_type: '',
      tpm: '',
      category: '',
      color: '',
      total_output_weight: ''
    })
    setSelectedYarn("")
    setSelectedTpm("")
    setSelectedColor("")
    setSelectedYarnWeight("") // reset weight when opening modal
    setIsYarnModalOpen(true)
  }
  const handleEdit = (entry: ConningEntry) => {
    setEditingEntry(entry)

    // IMPORTANT
    setSelectedYarn(entry.yarn_type || "")
    setSelectedTpm(entry.tpm || "")
    setSelectedColor(entry.color || "")

    setIsModalOpen(true)
  }

  const handleDelete = async (entry: ConningEntry) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    console.log("Deleting ID:", entry.id) // check in console

    const res = await fetch(`/api/conning?id=${entry.id}`, {
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

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const formData: ConningEntry = {
        id: editingEntry ? editingEntry.id : "",
        machine_id: data.machine_id || '',
        company_id: String(user?.company_id || ''),
        category: data.category || '',
        tpm: selectedTpm,
        yarn_type: data.yarn_type || selectedYarn || "",
        color: selectedColor || data.color || '', // ✅ FIXED
        weight: Number(data.weight) || 0,
        cones_size: data.cones_size || '', // Placeholder, replace with actual cone size if needed
        cones: Number(data.cones) || 0, // Placeholder, replace with actual cone count if needed
        date: data.date || new Date().toISOString().split('T')[0],
      }

      const res = await fetch("/api/conning", {
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


    const handleMachineChange = (value: string) => {
    setSelectedMachine(value)
  }
  const handleYarnChange = (value: string) => {
    setSelectedYarn(value)

    setYarnForm({
      yarn_type: value,
      category: "",
      color: "",
      tpm: "",
      total_output_weight: ""
    })

    setSelectedColor("")
    setSelectedTpm("")
    setSelectedYarnWeight("")
  }
  // const handleTpmChange = () => {
  //   console.log("Selected Yarn:", selectedYarn)
  //   console.log("Selected Category:", yarnForm.category)
  //   console.log("Selected Color:", selectedColor)


  //   if (yarn) {
  //     setSelectedTpm(yarn.tpm)
  //     setSelectedYarnWeight(yarn.total_output_weight.toString())
  //   } else {
  //     setSelectedYarnWeight("")
  //   }
  // }
  const handleColorChange = (value: string) => {
    // handleTpmChange();
    setSelectedColor(value)

    setYarnForm(prev => ({
      ...prev,
      color: value
    }))
    const yarn = totalEntries.find(
      (y) =>
        y.yarn_type === (yarnForm.yarn_type || selectedYarn) &&
        y.category === yarnForm.category &&
        y.color === value
    )
    if (yarn) {
      setYarnForm(prev => ({
        ...prev,
        total_output_weight: yarn.total_output_weight.toString()
      }))
      setSelectedYarnWeight(yarn.total_output_weight.toString())
    } else {
      setSelectedYarnWeight("")
      setYarnForm(prev => ({
        ...prev,
        total_output_weight: ""
      }))
    }
  }
  const columns = [
    { key: 'created_at', label: 'Date' },
    {
      key: 'machine_id',
      label: 'Machine ID',
      render: (value: string) => {
        const machine = machines.find((m) => m.id === value)

        if (!machine) return value

        // ✅ extract only number
        const number = machine.machine_number.replace(/\D/g, '')

        return number || machine.machine_number
      },
    },
    // { key: 'tpm', label: 'TPM' },
    { key: 'yarn_type', label: 'Yarn Type' },
    { key: 'category', label: 'Category' },
    { key: 'color', label: 'Color' },
    { key: 'cones_size', label: 'Cone Size' },
    { key: 'cones', label: 'Cone Count' },
    {
      key: 'weight',
      label: 'Weight (kg)',
      render: (value: string) => parseFloat(value).toFixed(2),
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className='row flex justify-between items-center'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Conning Management</h1>
          <p className="text-muted-foreground">Track cone winding operations</p>
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
        title="Conning Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
        emptyState="No conning entries yet. Click 'Add New' to create one."
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
            onChange: handleYarnChange,
            options: [...new Set(totalEntries.map(item => item.yarn_type))].map(yarn => ({
              value: yarn,
              label: yarn
            }))
          },

          // ================= FIX: TPM → CATEGORY =================
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            placeholder: 'Select Category',
            onChange: (value: string) => {
              setYarnForm(prev => ({
                ...prev,
                category: value
              }))
              setSelectedTpm("")
              setSelectedColor("")
            },

            options: [
              ...new Set(
                totalEntries
                  .filter(e =>
                    e.yarn_type === yarnForm.yarn_type
                  )
                  .map(e => e.category)
                  .filter(Boolean)
              )
            ].map(cat => ({
              value: cat,
              label: cat
            }))
          },

          {
            name: 'color',
            label: 'Color',
            type: 'select',
            placeholder: 'Select Color',
            onChange: handleColorChange,
            options: [
              ...new Set(
                totalEntries
                  .filter(e =>
                    e.yarn_type === yarnForm.yarn_type &&
                    e.category === yarnForm.category
                  )
                  .map(e => e.color)
              )
            ].map(color => ({
              value: color,
              label: color
            }))
          },

          {
            name: 'total_output_weight',
            label: 'Total Weight',
            type: 'text',
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
        // ✅ FORCE RERENDER
        isOpen={isModalOpen}
        title={editingEntry ? 'Edit Conning Entry' : 'Add New Conning Entry'}
        fields={[


         {
            name: 'machine_id',
            label: 'Machine ID',
            type: 'select',
            placeholder: 'Select Machine',
          
            required: true,
            onChange: handleMachineChange,
            options: machines.map((m) => ({
              value: m.machine_number,
              label: `${m.machine_number}`,
            })),
          },

          {
            name: 'yarn_type',
            label: 'Type',
            type: 'select',
            placeholder: 'Select yarn type',
            onChange: (value: string) => {
              setSelectedYarn(value)

              setYarnForm({
                yarn_type: value,
                category: "",
                color: "",
                tpm: "",
                total_output_weight: ""
              })

              setSelectedColor("")
              setSelectedTpm("")
            },
            options: [...new Set(totalEntries.map(item => item.yarn_type))].map(yarn => ({
              value: yarn,
              label: yarn
            }))
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            placeholder: 'Select Category',

            onChange: (value: string) => {
              setYarnForm(prev => ({
                ...prev,
                category: value,
                color: "" // reset color only
              }))

              setSelectedColor("")
            },
            options: [
              ...new Set(
                totalEntries
                  .filter(e =>
                    e.yarn_type === (selectedYarn || editingEntry?.yarn_type)
                  )
                  .map(e => e.category)
                  .filter(Boolean)
              )
            ].map(cat => ({
              value: cat,
              label: cat
            }))
          },
          // {
          //   name: 'tpm',
          //   label: 'TPM',
          //   type: 'select',
          //   value: selectedTpm || editingEntry?.tpm || "",
          //   placeholder: 'Select TPM',
          //   onChange: handleTpmChange,
          //   options: [
          //     ...new Set(
          //       totalEntries
          //         .filter(e =>
          //           (selectedYarn || editingEntry?.yarn_type)
          //             ? e.yarn_type === (selectedYarn || editingEntry?.yarn_type)
          //             : true
          //         )
          //         .map(e => e.tpm)
          //     )
          //   ].map(tpm => ({
          //     value: tpm,
          //     label: tpm
          //   }))
          // },

          {
            name: 'color',
            label: 'Color',
            type: 'select',

            placeholder: 'Select Color',
            onChange: (value: string) => {
              setSelectedColor(value)

              setYarnForm(prev => ({
                ...prev,
                color: value
              }))
              const yarn = totalEntries.find(
                (y) =>
                  y.yarn_type === (yarnForm.yarn_type || selectedYarn) &&
                  y.category === yarnForm.category &&
                  y.color === value
              )
              console.log("Found matching yarn:::::::::: ", yarn) // Debug log
              if (yarn) {
                setSelectedTpm(yarn.tpm)
              }
            },
            options: [
              ...new Set(
                totalEntries
                  .filter(e =>
                    e.yarn_type === selectedYarn &&
                    e.category === yarnForm.category
                  )
                  .map(e => e.color)
              )
            ].map(color => ({
              value: color,
              label: color
            }))
          },
          {
            name: 'cones_size',
            label: 'Cone Size',
            type: 'select',
            placeholder: 'Select Cone Size',
            required: true,
            options: [
              { value: '1500', label: '1500' },
              { value: '3000', label: '3000' }
            ]
          },
          { name: 'weight', label: 'Total Weight (kg)', type: 'number', placeholder: '0.00', required: true },
          { name: 'cones', label: 'Number of Cones', type: 'number', placeholder: '0', required: true },

        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}




