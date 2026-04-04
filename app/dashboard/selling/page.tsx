'use client'

import { useEffect, useState } from 'react'
import { DataTable } from '@/components/data-table'
import { FormModal } from '@/components/form-modal'
import type { SellingEntry } from '@/lib/types'
import { toast } from 'sonner'
import { DyeingTotalEntry } from '../dyeing/page'
import { useAuth } from '@/lib/auth-context'

export interface packingTotalEntry {
    tpm: string
    yarn_type: string
    color: string
    cone_size: string
    category: string
    total_boxes: string
    cones: string
    boxes: string
}

export default function PackingPage() {
    const [entries, setEntries] = useState<SellingEntry[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [totalEntries, setTotalEntries] = useState<DyeingTotalEntry[]>([])
    const [selectedYarn, setSelectedYarn] = useState<string>("")
    const [formData, setFormData] = useState<any>({})
    const [selectedTpm, setSelectedTpm] = useState<string>("")
    const [editingEntry, setEditingEntry] = useState<SellingEntry | null>(null)
    const [selectedColor, setSelectedColor] = useState("")
    const [loading, setLoading] = useState(false)
    const { user } = useAuth()
    const [yarnForm, setYarnForm] = useState({
        yarn_type: '',
        category: '',
        tpm: '',
        color: '',
        cone_size: '',
        cones: '',
        total_cones: ''
    })


    useEffect(() => {
        loadEntries()
    }, [])

    const loadEntries = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/selling?company_id=${user?.company_id}`)
            const response = await fetch(`/api/packing?company_id=${user?.company_id}&action=total`)  //
            const json = await res.json();
            const totalJson = await response.json()

            if (totalJson.status) {
                const formatted = totalJson.data.map((item: packingTotalEntry) => ({
                    tpm: item.tpm,
                    color: item.color,
                    total_boxes: item.total_boxes,
                    cones: item.cones,
                    yarn_type: item.yarn_type,
                    category: item.category,
                    cone_size: item.cone_size
                }))

                setTotalEntries(formatted)
            }

            if (json.status) {
                const formatted = json.data.map((item: any) => ({
                    id: item.id,
                    yarn_type: item.yarn_type,
                    tpm: Number(item.tpm),
                    category: item.category,
                    color: item.color,
                    cone_size: Number(item.cone_size),
                    box: Number(item.box),
                    extra_cones: Number(item.extra_cones),
                    total_cones: Number(item.total_cones),
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
        setSelectedYarn("")
        setSelectedTpm("")
        setSelectedColor("")
        setFormData({
            yarn_type: "",
            tpm: "",
            category: "",
            color: "",
            cones: "",
            cone_size: "",
            box: "",
            extra_cones: "",
        })

        setIsModalOpen(true)
    }


    const handleSubmit = async (data: Record<string, any>) => {

        try {
            const coneSize = Number(data.cone_size)
            const box = Number(data.box)
            const extra = Number(data.extra_cones || 0)

            const total_cones = (box * 12) + extra

            const payload = {
                company_id: Number(user?.company_id || ""),
                yarn_type: data.yarn_type,
                tpm: selectedTpm || data.tpm,
                category: data.category,
                color: data.color,
                cones: Number(data.cones),
                cone_size: coneSize,
                box: box,
                extra_cones: extra,
                total_cones: total_cones
            }

            const res = await fetch("/api/selling", {
                method: "POST", // ✅ ONLY POST
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            const json = await res.json()

            if (json.status) {
                toast.success("Entry added successfully")
                setIsModalOpen(false)
                loadEntries()
            } else {
                toast.error(json.message || "Failed to save entry")
            }

        } catch (error: any) {
            toast.error(error.message || "Failed to save entry")
        }
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
            cones: "",
            box: ""
        }))

        setSelectedColor("")
    }
    const handleTpmChange = (value: string) => {
        setSelectedTpm(value)

        const yarn = totalEntries.find(
            (y) => y.yarn_type === selectedYarn && y.tpm === value
        )
    }

    const handleColorChange = (value: string) => {
        setSelectedColor(value)
    }


    const columns = [
        { key: 'created_at', label: 'Date' },
        { key: 'yarn_type', label: 'Yarn Type' },
        { key: 'category', label: 'Category' },
        { key: 'color', label: 'Color' },
        { key: 'cone_size', label: 'Cone Size' },
        { key: 'box', label: 'Box' },
        { key: 'extra_cones', label: 'Extra Cones' },
        { key: 'total_cones', label: 'Total Cones' },
    ]

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Selling Management</h1>
                <p className="text-muted-foreground">Manage selling and sales operations</p>
            </div>

            <DataTable
                title="Selling Entries"
                columns={columns}
                data={entries}
                onAddNew={handleAddNew}
                isLoading={loading}
                emptyState="No selling entries yet. Click 'Add New' to create one."
            />

            <FormModal
                isOpen={isModalOpen}
                title="Add New Packing Entry"
                fields={[
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
                    { name: 'cones', label: 'Extra Cones', type: 'number', placeholder: '0', required: true },
                ]}
                initialData={formData}
                onSubmit={handleSubmit}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}
