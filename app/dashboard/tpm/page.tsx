// 'use client'

// import { useEffect, useState } from 'react'
// import { DataTable } from '@/components/data-table'
// import { FormModal } from '@/components/form-modal'
// import { toast } from 'sonner'
// import { useAuth } from '@/lib/auth-context'
// import { WeightModal } from '@/components/weight-modal'
// import { Button } from '@/components/ui/button'
// import { Weight } from 'lucide-react'

// type TPMEntry = {
//   id: string
//   company_id: string
//   admin_id: string
//   machine_no: string
//   batch_id: string
//   yarn_type: string
//   yarn_sub_type: string
//   tpm: string
//   input_weight: string
//   output_weight: string
//   weight_gap: string
//   created_at: string
// }

// export interface YarnTotalEntry {
//   yarn_type: string
//   yarn_sub_type: string
//   total_weight: string
// }
// export default function TPMPage() {
//   const { user } = useAuth()
//   const [entries, setEntries] = useState<TPMEntry[]>([])
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [totalEntries, setTotalEntries] = useState<YarnTotalEntry[]>([])
//   const [editingEntry, setEditingEntry] = useState<TPMEntry | null>(null)
//   const [loading, setLoading] = useState(false)
//   const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)
//   const [selectedYarnSubType, setSelectedYarnSubType] = useState<string>("")
//   const [selectedYarn, setSelectedYarn] = useState<string>("")
//   const [selectedYarnWeight, setSelectedYarnWeight] = useState<string>("")
//   const [formState, setFormState] = useState<any>({})
//   const [modalData, setModalData] = useState<any>({})
//   const [yarnForm, setYarnForm] = useState({
//     yarn_type: '',
//     yarn_sub_type: '',
//     total_weight: ''
//   })

//   type Machine = {
//     id: string
//     machine_number: string
//   }
//   const [machines, setMachines] = useState<Machine[]>([])

//   useEffect(() => {
//     loadEntries()
//     loadMachines()
//   }, [user?.company_id])

//   const loadEntries = async () => {
//     if (!user?.company_id) return
//     setLoading(true)
//     try {
//       const res = await fetch(`/api/tpm?company_id=${user?.company_id}`)
//       const response = await fetch(`/api/yarn?company_id=${user?.company_id}&action=total`)

//       const json = await res.json()
//       const totalJson = await response.json()
//       if (json.status) {

//         const totalFormatted = totalJson.data.map((item: any) => ({
//           yarn_type: item.yarn_type,
//           yarn_sub_type: item.yarn_sub_type,
//           total_weight: parseFloat(item.total_weight),
//         }))

//         setTotalEntries(totalFormatted)
//         const formatted = json.data.map((item: any) => ({
//           id: item.id,
//           company_id: item.company_id,
//           admin_id: item.admin_id,
//           machine_no: item.machine_no,
//           batch_id: item.batch_id,
//           yarn_type: item.yarn_type,
//           yarn_sub_type: item.yarn_sub_type,
//           tpm: item.tpm,
//           input_weight: item.input_weight,
//           output_weight: item.output_weight,
//           weight_gap: item.weight_gap,
//           created_at: item.created_at.split(' ')[0], // Format date to YYYY-MM-DD
//         }))
//         setEntries(formatted)
//       } else {
//         toast.error(json.message || 'Failed to load TPM entries')
//       }
//     } catch (error: any) {
//       toast.error(error.message || 'Failed to load TPM entries')
//     } finally {
//       setLoading(false)
//     }
//   }


//   const loadMachines = async () => {
//     if (!user?.company_id) return

//     try {
//       const res = await fetch(
//         `/api/machines?company_id=${user.company_id}&machine_type=Twisting Machine`
//       )

//       const json = await res.json()

//       if (json.status) {
//         const formatted = json.data.map((item: any) => ({
//           id: String(item.id),
//           machine_number: String(item.machine_number),
//         }))

//         setMachines(formatted)
//       } else {
//         toast.error(json.message || "Failed to load machines")
//       }
//     } catch (err: any) {
//       toast.error(err.message)
//     }
//   }
//   const handleAddNew = () => {
//     setFormState({}) // ✅ RESET FORM STATE
//     setEditingEntry({
//       id: '',
//       batch_id: generateBatchId(),
//       created_at: new Date().toISOString().split('T')[0],
//       company_id: user?.company_id?.toString() || '',
//       admin_id: user?.id?.toString() || '',
//       machine_no: '',
//       yarn_type: '',
//       yarn_sub_type: '',
//       tpm: '',
//       input_weight: '',
//       output_weight: '',
//       weight_gap: '',
//     })
//     setIsModalOpen(true)
//   }

//   const handleYarn = () => {

//     setYarnForm({
//       yarn_type: '',
//       yarn_sub_type: '',
//       total_weight: ''
//     })
//     setIsYarnModalOpen(true)
//   }
//   const handleYarnChange = (value: string) => {
//     setSelectedYarn(value)
//     setYarnForm((prev) => ({
//       ...prev,
//       yarn_type: value
//       , yarn_sub_type: '',
//       total_weight: ''
//     }))
//     setSelectedYarnSubType("")
//     setSelectedYarnWeight("")
//   }
//   const filteredSubTypes = totalEntries.filter(
//     (y) => y.yarn_type === selectedYarn && y.yarn_sub_type
//   );
//   const subTypeOptions = [
//     ...new Set(filteredSubTypes.map((y) => y.yarn_sub_type)),
//   ].map((sub) => ({
//     value: sub,
//     label: sub,
//   }));


//   const handleSubType = (value: string) => {
//     setSelectedYarnSubType(value)

//     const yarn = totalEntries.find(
//       (y) => y.yarn_type === selectedYarn && y.yarn_sub_type === value
//     )

//     setYarnForm((prev) => ({
//       ...prev,
//       yarn_sub_type: value
//     }))
//     if (yarn) {

//       setYarnForm({
//         yarn_type: yarn.yarn_type,
//         yarn_sub_type: yarn.yarn_sub_type,
//         total_weight: yarn.total_weight.toString()
//       })
//       setSelectedYarnWeight(yarn.total_weight.toString())
//     } else {
//       setSelectedYarnWeight("")
//     }
//   }

//   const handleEdit = (entry: TPMEntry) => {
//     setEditingEntry(entry)

//     setFormState({
//       batch_id: entry.batch_id,
//       machine_no: entry.machine_no,
//       tpm: entry.tpm,
//       yarn_type: entry.yarn_type,
//       subType: entry.yarn_sub_type,
//       input_weight: entry.input_weight,
//       output_weight: entry.output_weight,
//     })

//     setIsModalOpen(true)
//   }

//   const handleDelete = async (entry: TPMEntry) => {

//     if (!confirm("Are you sure you want to delete this entry?")) return

//     try {

//       const res = await fetch(`/api/tpm?id=${entry.id}`, {
//         method: 'DELETE',
//       })

//       const json = await res.json()

//       if (json.status) {

//         toast.success("Entry deleted successfully")
//         loadEntries()

//       } else {

//         toast.error(json.message)

//       }

//     } catch (error: any) {

//       toast.error(error.message)

//     }

//   }

//   const getSubTypes = (type: string) => {
//     return [
//       ...new Set(
//         totalEntries
//           .filter((entry) => entry.yarn_type === type)
//           .map((entry) => entry.yarn_sub_type)
//       ),
//     ]
//   }

//   const generateBatchId = () => {
//     const now = new Date();
//     const microPart = now.getTime().toString().slice(-5); // last 5 digits of timestamp in ms
//     const batchId = `BATCH-${microPart}`;

//     console.log(batchId); // e.g., BATCH-54321

//     return batchId  // e.g., 173045
//   }


//   const handleSubmit = async (data: Record<string, any>) => {
//     try {
//       console.log("Yarn Type in TPM form:", data.yarn_type); // Debug log for yarn type
//       const formData: TPMEntry = {
//         id: editingEntry ? editingEntry.id : "",
//         tpm: data.tpm || "0",
//         yarn_type: data.yarn_type || formState.yarn_type || "",
//         yarn_sub_type: data.subType || formState.subType || "",
//         input_weight: data.input_weight || "0",
//         output_weight: data.output_weight || "0",
//         weight_gap: data.weight_gap || "0",
//         machine_no: data.machine_no || "",
//         batch_id: data.batch_id || "",
//         created_at: editingEntry
//           ? editingEntry.created_at
//           : new Date().toISOString().split("T")[0],

//         company_id: user?.company_id.toString() || "",
//         admin_id: user?.id.toString() || "",
//       }

//       const res = await fetch("/api/tpm", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",

//         },
//         body: JSON.stringify(formData),
//       })
//       console.log("FINAL FORM DATA::::::::::::::;; 👉", formData)

//       const json = await res.json()

//       if (json.status) {
//         toast.success(`Entry ${editingEntry ? "updated" : "added"} successfully`)
//         setIsModalOpen(false)
//         loadEntries()
//         setEditingEntry(null)
//       } else {
//         toast.error(json.message || "Failed to save entry")
//       }

//     } catch (error: any) {
//       toast.error(error.message || "Failed to save entry")
//     }
//   }

//   const columns = [
//     { key: 'created_at', label: 'Date' },
//     {
//       key: 'machine_no',
//       label: 'Machine ID',
//       render: (value: string) => {
//         const machine = machines.find((m) => m.id === value)
//         return machine ? `M-${machine.machine_number}` : value
//       },
//     },
//     {
//       key: 'tpm',
//       label: 'TPM',
//       render: (value: number) => `${Number(value).toFixed(0)} rpm`,
//     },
//     { key: 'yarn_type', label: 'Yarn Type' },
//     { key: 'yarn_sub_type', label: 'Yarn Sub-Type' },
//     { key: 'input_weight', label: 'Input Weight' },
//     { key: 'output_weight', label: 'Output Weight' },
//   ]

//   return (
//     <div className="p-6 md:p-8 max-w-7xl mx-auto">
//       <div className='row flex justify-between items-center'>
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-foreground mb-2">TPM Management</h1>
//           <p className="text-muted-foreground">Track turns per minute and machine performance</p>
//         </div>
//         <Button
//           onClick={handleYarn}
//           className="bg-primary/80 hover:bg-primary/60 text-primary-foreground gap-2"
//         >
//           <Weight size={16} />
//           Status check
//         </Button>

//       </div>


//       <DataTable
//         title="TPM Entries"
//         columns={columns}
//         data={entries}
//         onAddNew={handleAddNew}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//         isLoading={loading}   // ✅ loading state
//         emptyState="No TPM entries yet. Click 'Add New' to create one."
//       />
//       <WeightModal
//         isOpen={isYarnModalOpen}
//         title={'Yarn Weight'}
//         fields={[
//           {
//             name: 'yarn_type',
//             label: 'Type',
//             type: 'select',
//             placeholder: 'Select yarn type',
//             required: true,
//             onChange: handleYarnChange,
//             options: [
//               ...[...new Set(totalEntries.map(item => item.yarn_type))].map(yarn => ({
//                 value: yarn,
//                 label: yarn
//               })),
//             ],
//           },
//           {
//             name: 'yarn_sub_type',
//             label: 'Sub Type',
//             type: 'select',
//             placeholder: 'Select yarn sub-type',
//             required: true,
//             options: subTypeOptions,
//             onChange: handleSubType
//           },
//           {
//             name: 'total_weight',
//             label: 'Total Weight',
//             type: 'text',
//             // value: selectedYarnWeight,
//             placeholder: '0.00 KG',
//             readOnly: true,
//             disabled: true
//           }
//         ]}
//         initialData={yarnForm}
//         onSubmit={() => setIsYarnModalOpen(false)}
//         onClose={() => setIsYarnModalOpen(false)}
//       />

//       <FormModal
//         key={editingEntry?.id || 'new'}
//         isOpen={isModalOpen}
//         title={editingEntry ? 'Edit TPM Entry' : 'Add New TPM Entry'}
//         fields={[

//           { name: 'batch_id', label: 'Batch ID', type: 'text', placeholder: 'Auto Generated', readOnly: true, disabled: true },
//           {
//             name: 'machine_no',
//             label: 'Machine ID',
//             type: 'select',
//             placeholder: 'Select Machine',
//             required: true,
//             value: formState.machine_no || '',
//             options: machines.map((m) => ({
//               value: m.id,
//               label: `M-${m.machine_number}`,
//             })),
//           },
//           {
//             name: 'tpm', label: 'TPM (Turns/Min)', type: 'number', placeholder: '0.00', required: true
//             , value: formState.tpm,
//           },
//           {
//             name: 'yarn_type',   // ✅ FIXED
//             label: 'Type',
//             type: 'select',
//             placeholder: 'Select yarn type',
//             required: true,
//             value: formState.yarn_type || '',
//             options: [
//               ...[...new Set(totalEntries.map(item => item.yarn_type))].map(yarn => ({
//                 value: yarn,
//                 label: yarn
//               })),
//             ],
//             onChange: (val: string) => {
//               setFormState((prev: any) => ({
//                 ...prev,

//                 yarn_type: val,
//                 subType: '', // reset subtype
//               }))
//             },
//           },
//           {
//             name: 'subType',
//             label: 'Sub Type',
//             type: 'select',
//             required: true,
//             value: formState.subType || '',
//             options:
//               formState.yarn_type === 'Other'
//                 ? [{ value: 'Other', label: 'Other' }]
//                 : getSubTypes(formState.yarn_type).map((s) => ({
//                   value: s,
//                   label: s,
//                 })),
//             onChange: (val: string) => {
//               setFormState((prev: any) => ({
//                 ...prev,
//                 subType: val,
//               }))
//             },
//           },
//           { name: 'input_weight', label: 'Input Weight', type: 'number', placeholder: '0.00', required: true },
//           { name: 'output_weight', label: 'Output Weight', type: 'number', placeholder: '0.00', required: true },
//         ]}
//         initialData={formState}
//         onSubmit={handleSubmit}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   )
// }


'use client'

import { useEffect, useMemo, useState } from 'react'
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
  yarn_sub_type: string
  tpm: string
  input_weight: string
  output_weight: string
  weight_gap: string
  created_at: string
}

type YarnTotalEntry = {
  yarn_type: string
  yarn_sub_type: string
  total_weight: number
}

type Machine = {
  id: string
  machine_number: string
}

export default function TPMPage() {
  const { user } = useAuth()

  const [entries, setEntries] = useState<TPMEntry[]>([])
  const [machines, setMachines] = useState<Machine[]>([])
  const [totalEntries, setTotalEntries] = useState<YarnTotalEntry[]>([])

  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isYarnModalOpen, setIsYarnModalOpen] = useState(false)

  const [editingEntry, setEditingEntry] = useState<TPMEntry | null>(null)
  const [formState, setFormState] = useState<any>({})

  const [yarnForm, setYarnForm] = useState({
    yarn_type: '',
    yarn_sub_type: '',
    total_weight: ''
  })

  // ------------------ LOAD DATA ------------------
  useEffect(() => {
    if (!user?.company_id) return
    loadEntries()
    loadMachines()
  }, [user?.company_id])

  const loadEntries = async () => {
    setLoading(true)
    try {
      const [tpmRes, yarnRes] = await Promise.all([
        fetch(`/api/tpm?company_id=${user?.company_id}`),
        fetch(`/api/yarn?company_id=${user?.company_id}&action=total`)
      ])

      const tpmJson = await tpmRes.json()
      const yarnJson = await yarnRes.json()

      if (!tpmJson.status) throw new Error(tpmJson.message)

      setEntries(
        tpmJson.data.map((i: any) => ({
          ...i,
          created_at: i.created_at.split(' ')[0],
        }))
      )

      setTotalEntries(
        yarnJson.data.map((i: any) => ({
          yarn_type: i.yarn_type,
          yarn_sub_type: i.yarn_sub_type,
          total_weight: Number(i.total_weight),
        }))
      )
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadMachines = async () => {
    try {
      const res = await fetch(
        `/api/machines?company_id=${user?.company_id}&machine_type=Twisting Machine`
      )
      const json = await res.json()

      if (!json.status) throw new Error(json.message)

      setMachines(
        json.data.map((m: any) => ({
          id: String(m.id),
          machine_number: String(m.machine_number),
        }))
      )
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // ------------------ HELPERS ------------------
  const generateBatchId = () =>
    `BATCH-${Date.now().toString().slice(-5)}`

  const yarnTypes = useMemo(
    () => [...new Set(totalEntries.map(y => y.yarn_type))],
    [totalEntries]
  )

  const getSubTypes = (type: string) =>
    totalEntries
      .filter(y => y.yarn_type === type)
      .map(y => y.yarn_sub_type)

  // ------------------ ACTIONS ------------------
  const handleAddNew = () => {
    const entry = {
      id: '',
      batch_id: generateBatchId(),
      created_at: new Date().toISOString().split('T')[0],
      company_id: user?.company_id?.toString() || '',
      admin_id: user?.id?.toString() || '',
      machine_no: '',
      yarn_type: '',
      yarn_sub_type: '',
      tpm: '',
      input_weight: '',
      output_weight: '',
      weight_gap: '',
    }

    setEditingEntry(entry)
    setFormState(entry)
    setIsModalOpen(true)
  }

  const handleEdit = (entry: TPMEntry) => {
    setEditingEntry(entry)
    setFormState({
      ...entry,
      subType: entry.yarn_sub_type,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (entry: TPMEntry) => {
    if (!confirm('Delete this entry?')) return

    try {
      const res = await fetch(`/api/tpm?id=${entry.id}`, { method: 'DELETE' })
      const json = await res.json()

      if (!json.status) throw new Error(json.message)

      toast.success('Deleted')
      loadEntries()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // ------------------ YARN MODAL ------------------
  const handleYarnChange = (type: string) => {
    setYarnForm({
      yarn_type: type,
      yarn_sub_type: '',
      total_weight: '',
    })
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

  const subTypeOptions = useMemo(() => {
    return getSubTypes(yarnForm.yarn_type).map(s => ({
      value: s,
      label: s,
    }))
  }, [yarnForm.yarn_type, totalEntries])

  // ------------------ SUBMIT ------------------
  const handleSubmit = async (data: any) => {
    try {
      const payload: TPMEntry = {
        ...editingEntry!,
        ...data,
        yarn_sub_type: data.subType,
        company_id: user?.company_id.toString() || '',
        admin_id: user?.id.toString() || '',
      }

      const res = await fetch('/api/tpm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      if (!json.status) throw new Error(json.message)

      toast.success('Saved')
      setIsModalOpen(false)
      loadEntries()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // ------------------ TABLE ------------------
  const columns = [
    { key: 'created_at', label: 'Date' },
    {
      key: 'machine_no',
      label: 'Machine ID',
      render: (v: string) => {
        const m = machines.find(x => x.id === v)
        return m ? `M-${m.machine_number}` : v
      },
    },
    { key: 'tpm', label: 'TPM', render: (v: number) => `${Number(v)} rpm` },
    { key: 'yarn_type', label: 'Yarn Type' },
    { key: 'yarn_sub_type', label: 'Sub-Type' },
    { key: 'input_weight', label: 'Input' },
    { key: 'output_weight', label: 'Output' },
  ]

  // ------------------ UI ------------------
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">TPM Management</h1>
          <p className="text-muted-foreground">
            Track machine performance
          </p>
        </div>

        <Button onClick={() => setIsYarnModalOpen(true)}>
          <Weight size={16} /> Status Check
        </Button>
      </div>

      <DataTable
        title="TPM Entries"
        columns={columns}
        data={entries}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={loading}
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

      {/* Form Modal */}
      <FormModal
        isOpen={isModalOpen}
        title={editingEntry ? 'Edit Entry' : 'Add Entry'}
        fields={[
          { name: 'batch_id', label: 'Batch', type: 'text', disabled: true },
          {
            name: 'machine_no',
            label: 'Machine',
            type: 'select',
            options: machines.map(m => ({
              value: m.id,
              label: `M-${m.machine_number}`,
            })),
          },
          { name: 'tpm', label: 'TPM', type: 'number' },
          {
            name: 'yarn_type',
            label: 'Type',
            type: 'select',
            options: yarnTypes.map(y => ({ value: y, label: y })),
            onChange: (v: string) =>
              setFormState((p: any) => ({ ...p, yarn_type: v, subType: '' })),
          },
          {
            name: 'subType',
            label: 'Sub Type',
            type: 'select',
            options: getSubTypes(formState.yarn_type).map(s => ({
              value: s,
              label: s,
            })),
          },
          { name: 'input_weight', label: 'Input', type: 'number' },
          { name: 'output_weight', label: 'Output', type: 'number' },
        ]}
        initialData={formState}
        onSubmit={handleSubmit}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}