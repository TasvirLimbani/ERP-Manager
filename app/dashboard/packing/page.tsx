'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import { storage, generateId } from '@/lib/storage'
import type { PackingEntry } from '@/lib/types'
import { toast } from 'sonner'
import { DyeingTotalEntry } from '../dyeing/page'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Weight } from 'lucide-react'
import { WeightModal } from '@/components/weight-modal'

export interface ConingTotalEntry {
  tpm: string
  yarn_type: string
  color: string
  total_cones: number
}

export default function PackingPage() {
  const [entries, setEntries] = useState<PackingEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PackingEntry | null>(null)
  const [totalEntries, setTotalEntries] = useState<ConingTotalEntry[]>([])
  const [selectedYarn, setSelectedYarn] = useState<string>("")
  const [selectedTpm, setSelectedTpm] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState("")
  const { user } = useAuth()
  const [selectedYarnWeight, setSelectedYarnWeight] = useState<string>("")
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    tpm: '',
    color: '',
    total_cones: ''
  })

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    try {
      const res = await fetch(`/api/packing?company_id=${user?.company_id}`)
      const response = await fetch(`/api/conning?company_id=${user?.company_id}&action=total`)  //
      const json = await res.json();
      const totalJson = await response.json()

      if (totalJson.status) {
        const formatted = totalJson.data.map((item: ConingTotalEntry) => ({
          tpm: item.tpm,
          color: item.color,
          yarn_type: item.yarn_type,
          total_cones: item.total_cones,
        }))

        setTotalEntries(formatted)
      }

      if (json.status) {
        const formatted = json.data.map((item: any) => ({
          id: item.id,
          machine_id: item.machine_id,
          yarn_type: item.yarn_type,
          tpm: Number(item.tpm),
          color: item.color,
          cones: Number(item.cones),
          cone_size: Number(item.cone_size),
          box: Number(item.box),
          extra_pis: Number(item.extra_pis),
          created_at: item.created_at.split(' ')[0],
        }));

        setEntries(formatted);
      } else {
        console.error(json.message);
      }
    } catch (error) {
      console.error("Error loading entries:", error);
    }
  };

  const handleAddNew = () => {
    setSelectedYarn("");
    setSelectedTpm("");
    setSelectedColor("");

    setEditingEntry({
      id: "",
      company_id: String(user?.company_id || ""),
      machine_id: "",
      yarn_type: "",
      tpm: "",
      color: "",
      cones: "",
      cone_size: "", // ✅ fixed
      box: "",
      extra_pis: "",
      created_at: new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(true);
  };

  const handleYarn = () => {
    setYarnForm({
      yarn_type: '',
      tpm: '',
      color: '',
      total_cones: ''
    })
    setSelectedYarn("")
    setSelectedTpm("")
    setSelectedColor("")
    setSelectedYarnWeight("") // reset weight when opening modal
    setIsYarnModalOpen(true)
  }

  const handleEdit = (entry: PackingEntry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDelete = async (entry: PackingEntry) => {
    if (!confirm("Are you sure you want to delete this entry?")) return

    console.log("Deleting ID:", entry.id) // check in console

    const res = await fetch(`/api/packing?id=${entry.id}`, {
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
      const isEdit = !!editingEntry?.id

      const payload = {
        company_id: Number(user?.company_id),
        machine_id: Number(data.machine_id),
        yarn_type: data.yarn_type,
        tpm: Number(data.tpm),
        color: data.color,
        cones: Number(data.cones),
        cone_size: Number(data.cone_size),
        box: Number(data.box),
        extra_pis: Number(data.extra_pis || 0),
      }
      const res = await fetch("/api/packing", {
        method: "POST", // ✅ always POST
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          ...(isEdit && { id: editingEntry.id }) // send id for update
        }),
      })

      const json = await res.json()

      if (json.status) {
        toast.success(`Entry ${isEdit ? "updated" : "added"} successfully`)
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


  const handleYarnChange = (value: string) => {
    setSelectedYarn(value)
    setYarnForm((prev) => ({
      ...prev,
      yarn_type: value
    }))
    setSelectedTpm("")
    setSelectedYarnWeight("")
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


      setSelectedYarnWeight(yarn.total_cones.toString())
    } else {
      setSelectedYarnWeight("")
    }
  }

const handleColorChange = (value: string) => {
    setSelectedColor(value)
    setYarnForm((prev) => ({
      ...prev,
      color: value
    }))
    const yarn = totalEntries.find(
      (y) => y.yarn_type === selectedYarn && y.tpm === selectedTpm && y.color === value
    )

    console.log("Finding yarn with:", {
      yarn_type: selectedYarn,
      tpm: selectedTpm,
      color: value,
      total_cones: yarn?.total_cones
    })
    if (yarn) {
      setYarnForm((prev) => ({
        ...prev,
        total_cones: yarn.total_cones.toString()
      }))
      setSelectedYarnWeight(yarn.total_cones.toString())
    } else {
      setSelectedYarnWeight("")
    }
  }


  const columns = [
    { key: 'created_at', label: 'Date' },
    { key: 'machine_id', label: 'Machine ID' },

    { key: 'yarn_type', label: 'Yarn Type' },
    { key: 'tpm', label: 'TPM' },
    { key: 'color', label: 'Color' },

    { key: 'cone_size', label: 'Cone Size' },
    { key: 'box', label: 'Box' },
    { key: 'extra_pis', label: 'Extra Pise' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className='row flex justify-between items-center'>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Packing Management</h1>
          <p className="text-muted-foreground">Manage packing and packaging operations</p>
        </div>

        <Button
          onClick={handleYarn}
          className="bg-primary/80 hover:bg-primary/60 text-primary-foreground gap-2"
        >
          <Weight size={16} />
          Add New
        </Button>
      </div>

      <DataTable
        title="Packing Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyState="No packing entries yet. Click 'Add New' to create one."
      />


      <WeightModal
              isOpen={isYarnModalOpen}
              title={'Yarn Weight'}
              fields={[
                {
                  name: 'yarn_type',
                  label: 'Type',
                  // value: yarnForm.yarn_type,
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
                  placeholder: 'Select TPM',
                  onChange: handleTpmChange,
                  options: [...new Set(
                    totalEntries
                      .filter(e => yarnForm.yarn_type)
                      .map(e => e.tpm)
                  )].map(tpm => ({
                    value: tpm,
                    label: tpm
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
                        .filter(e => {
                          const yarn = (yarnForm.yarn_type).trim()
                          const tpm = String(yarnForm.tpm).trim()
      
                          return (
                            e.yarn_type?.trim() === yarn &&
                            String(e.tpm).trim() === tpm
                          )
                        })
                        .map(e => e.color)
                    )
                  ].map(color => ({
                    value: color,
                    label: color
                  }))
                },
                {
                  name: 'total_cones',
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
        title={editingEntry ? 'Edit Packing Entry' : 'Add New Packing Entry'}
        fields={[
          {
            name: 'yarn_type',
            label: 'Type',
            value: selectedYarn || editingEntry?.yarn_type || "",
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
            value: selectedTpm || editingEntry?.tpm || "",
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
            name: 'color',
            label: 'Color',
            type: 'select',
            value: selectedColor || editingEntry?.color || "",
            placeholder: 'Select Color',
            onChange: handleColorChange,
            options: [...new Set(totalEntries.map(e => e.color))].map(color => ({
              value: color,
              label: color
            }))
          },
          { name: 'cones', label: 'Number of Cones', type: 'number', placeholder: '0', required: true },
          {
            name: 'cone_size',
            label: 'Cone Size',
            type: 'select',
            placeholder: 'Select Cone Size',
            required: true,
            options: [
              { value: '1500', label: '1500' },
              { value: '3000', label: '3000' }
            ]
          },
          { name: 'box', label: 'Box', type: 'text', placeholder: 'e.g., Box-01', required: true },
          { name: 'machine_id', label: 'Machine ID', type: 'text', placeholder: 'e.g., M-01', required: true },
          { name: 'extra_pis', label: 'Extra Pise', type: 'text', placeholder: 'e.g., 10', required: false },
        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
