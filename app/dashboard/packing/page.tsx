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
  category: string
  color: string
  cone_size: string
  total_cones: number
}

export default function PackingPage() {
  const [entries, setEntries] = useState<PackingEntry[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<PackingEntry | null>(null)
  const [totalEntries, setTotalEntries] = useState<ConingTotalEntry[]>([])
  const [selectedYarn, setSelectedYarn] = useState<string>("")
  const [selectedTpm, setSelectedTpm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedMachine, setSelectedMachine] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const [selectedYarnWeight, setSelectedYarnWeight] = useState<string>("")
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    category: '',
    tpm: '',
    color: '',
    cone_size: '',
    total_cones: ''
  })


  type Machine = {
    id: string
    machine_number: string
  }
  const [machines, setMachines] = useState<Machine[]>([])

  useEffect(() => {
    loadEntries()
    loadMachines()
  }, [])

  const loadEntries = async () => {
    setLoading(true)
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
          category: item.category,
          cone_size: item.cone_size,
          total_cones: item.total_cones,
        }))

        setTotalEntries(formatted)
      }

      if (json.status) {
        const formatted = json.data.map((item: any) => ({
          id: item.id,
          machine_id: item.machine_id,
          yarn_type: item.yarn_type,
          category: item.category,
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
    finally {
      setLoading(false)
    }
  };

  const handleAddNew = () => {
    setSelectedYarn("");
    setSelectedTpm("");
    setSelectedCategory
    setSelectedColor("");

    setEditingEntry({
      id: "",
      company_id: String(user?.company_id || ""),
      machine_id: "",
      yarn_type: "",
      tpm: "",
      color: "",
      category: "",
      cones: "",
      cone_size: "", // ✅ fixed
      box: "",
      extra_pis: "",
      created_at: new Date().toISOString().split('T')[0],
    });

    setIsModalOpen(true);
  };


  const loadMachines = async () => {
    if (!user?.company_id) return

    try {
      const res = await fetch(
        `/api/machines?company_id=${user.company_id}&machine_type=Packaging Machine`
      )

      const json = await res.json()

      if (json.status) {
        const formatted = json.data.map((item: any) => ({
          id: String(item.id),
          machine_number: item.machine_number,
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
      category: '',
      tpm: '',
      cone_size: '',
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
    setSelectedYarn(entry.yarn_type || "")
    setSelectedTpm(String(entry.tpm || ""))
    setSelectedCategory(entry.category || "")
    setSelectedColor(entry.color || "")
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

    const boxValue = Number(data.box || 0);

    if (boxValue <= 0) {
      toast.error("Please enter box");
      return;
    }

    const inputCones = boxValue * 12;

    const yarn = totalEntries.find(
      (y) =>
        y.yarn_type === (yarnForm.yarn_type || selectedYarn) &&
        y.category === yarnForm.category &&
        y.color === selectedColor &&
        String(y.cone_size) === String(data.cone_size)
    );

    console.log("FOUND YARN:", yarn);

    if (!yarn) {
      toast.error("Stock not found for selected combination");
      return;
    }

    if (Number(yarn.total_cones) < inputCones) {
      toast.error(`Only ${Math.floor(yarn.total_cones / 12)} box available`);
      return;
    }

    try {
      const isEdit = !!editingEntry?.id;

      const payload = {
        company_id: Number(user?.company_id),
        machine_id: Number(selectedMachine),
        tpm: Number(selectedTpm || data.tpm),
        yarn_type: data.yarn_type || selectedYarn || "",
        category: data.category || yarnForm.category || "",
        color: selectedColor || data.color || "",
        cone_size: Number(data.cone_size),

        box: boxValue,

        extra_pis: Number(data.extra_pis) || 0,
      };

      const res = await fetch("/api/packing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          ...(isEdit && { id: editingEntry.id })
        }),
      });

      const json = await res.json();

      if (json.status) {
        toast.success(`Entry ${isEdit ? "updated" : "added"} successfully`);
        setIsModalOpen(false);
        loadEntries();
        setEditingEntry(null);
      } else {
        toast.error(json.message || "Failed to save entry");
      }

    } catch (error: any) {
      toast.error(error.message || "Failed to save entry");
    }
  }

  const handleMachineChange = (value: string) => {
    setSelectedMachine(value)
    console.log("SUBMIT DATA::::::::::::", selectedMachine)

  }

  const handleYarnChange = (value: string) => {
    setSelectedYarn(value)

    setYarnForm(prev => ({
      ...prev,
      yarn_type: value,
      category: "",   // ✅ RESET
      tpm: "",
      color: "",
      cone_size: "",
      total_cones: ""
    }))

    setSelectedTpm("")
    setSelectedColor("")
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

  // const handleColorChange = (value: string) => {
  //   setSelectedColor(value)
  //   setYarnForm((prev) => ({
  //     ...prev,
  //     color: value
  //   }))
  //   const yarn = totalEntries.find(
  //     (y) => y.yarn_type === selectedYarn && y.category === yarnForm.category && y.color === value
  //   )

  //   console.log("Finding yarn with:", {
  //     yarn_type: selectedYarn,
  //     category: yarnForm.category,
  //     color: value,
  //     cone_size: yarnForm.cone_size,
  //     total_cones: yarn?.total_cones
  //   })
  //   if (yarn) {
  //     setYarnForm((prev) => ({
  //       ...prev,
  //       total_cones: yarn.total_cones.toString()
  //     }))
  //     setSelectedYarnWeight(yarn.total_cones.toString())
  //   } else {
  //     setSelectedYarnWeight("")
  //   }
  // }


  const handleColorChange = (value: string) => {
    setSelectedColor(value)

    setYarnForm(prev => ({
      ...prev,
      color: value,
      cone_size: "",      // ✅ reset
      total_cones: ""     // ✅ reset
    }))

    setSelectedYarnWeight("")
  }


  const columns = [
    { key: 'created_at', label: 'Date' },
    { key: 'yarn_type', label: 'Yarn Type' },
    { key: 'category', label: 'Category' },
    // { key: 'tpm', label: 'TPM' },
    { key: 'color', label: 'Color' },
    { key: 'cone_size', label: 'Cone Size' },
    { key: 'box', label: 'Box' },

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
          status check
        </Button>
      </div>

      <DataTable
        title="Packing Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
        emptyState="No packing entries yet. Click 'Add New' to create one."
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

            value: yarnForm.category || "",   // ✅ ADD THIS

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
                    e.yarn_type?.trim() === yarnForm.yarn_type?.trim()
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
            name: 'cone_size',
            label: 'Cone Size',
            type: 'select',
            placeholder: 'Select Cone Size',

            value: yarnForm.cone_size || "",

            onChange: (value: string) => {
              const selected = totalEntries.find(e =>
                e.yarn_type === yarnForm.yarn_type &&
                e.category === yarnForm.category &&
                e.color === yarnForm.color &&
                String(e.cone_size) === String(value)
              )

              setYarnForm(prev => ({
                ...prev,
                cone_size: value,
                total_cones: selected ? String(selected.total_cones) : ""
              }))
            },
            options: [
              ...new Set(
                totalEntries
                  .filter(e =>
                    e.yarn_type === yarnForm.yarn_type &&
                    e.category === yarnForm.category &&
                    e.color === yarnForm.color
                  )
                  .map(e => e.cone_size)
                  .filter(Boolean)
              )
            ].map(size => ({
              value: String(size),
              label: String(size)
            }))
          },
          {
            name: 'total_cones',
            label: 'Total Cones',
            type: 'text',
            value: yarnForm.cone_size ? yarnForm.total_cones : "",
            placeholder: '0.00',
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
            name: 'machine_id',
            label: 'Machine ID',
            type: 'select',
            placeholder: 'Select Machine',
            required: true,
            onChange: handleMachineChange, // optional
            options: machines.map((m) => ({
              value: m.machine_number,
              label: `${m.machine_number}`,
            })),
          },
          {
            name: 'yarn_type',
            label: 'Type',
            // value: selectedYarn || editingEntry?.yarn_type || "",
            type: 'select',
            placeholder: 'Select yarn type',
            onChange: handleYarnChange,
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
                color: "",// reset color only
                cone_size: ""
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
                color: value,
                cone_size: ""   // ✅ ADD THIS
              }))

              const yarn = totalEntries.find(
                (y) =>
                  y.yarn_type === (yarnForm.yarn_type || selectedYarn) &&
                  y.category === yarnForm.category &&
                  y.color === value
              )

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
            name: 'cone_size',
            label: 'Cone Size',
            type: 'select',
            placeholder: 'Select Cone Size',
            required: true,

            options: [
              ...new Set(
                totalEntries
                  .filter(e =>
                    e.yarn_type === selectedYarn &&
                    e.category === yarnForm.category &&
                    e.color === selectedColor
                  )
                  .map(e => e.cone_size)
                  .filter(Boolean)
              )
            ].map(size => ({
              value: String(size),
              label: String(size)
            }))
          },
          { name: 'box', label: 'Box', type: 'number', placeholder: 'e.g., Box-01', required: true },
        ]}
        initialData={editingEntry || undefined}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
