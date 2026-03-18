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
    total_cones: string
    total_boxes: string
    total_extra_pis: string
}

export default function PackingPage() {
    const [entries, setEntries] = useState<SellingEntry[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [totalEntries, setTotalEntries] = useState<DyeingTotalEntry[]>([])
    const [selectedYarn, setSelectedYarn] = useState<string>("")
    const [formData, setFormData] = useState<any>({})
    const [selectedTpm, setSelectedTpm] = useState<string>("")
    const [selectedColor, setSelectedColor] = useState("")
    const { user } = useAuth()

    useEffect(() => {
        loadEntries()
    }, [])

    const loadEntries = async () => {
        try {
            const res = await fetch(`/api/selling?company_id=${user?.company_id}`)
            const response = await fetch(`/api/packing?company_id=${user?.company_id}&action=total`)  //
            const json = await res.json();
            const totalJson = await response.json()

            if (totalJson.status) {
                const formatted = totalJson.data.map((item: packingTotalEntry) => ({
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
                    yarn_type: item.yarn_type,
                    tpm: Number(item.tpm),
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
    };

    const handleAddNew = () => {
        setSelectedYarn("")
        setSelectedTpm("")
        setSelectedColor("")
        setFormData({
            yarn_type: "",
            tpm: "",
            color: "",
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

            const total_cones = (box * coneSize) + extra

            const payload = {
                company_id: String(user?.company_id || ""),

                yarn_type: data.yarn_type, tpm: Number(data.tpm), color: data.color, cone_size: coneSize, cones: data.cones, box: box

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
        setSelectedTpm("")

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
        { key: 'tpm', label: 'TPM' },
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
                title="Packing Entries"
                columns={columns}
                data={entries}
                onAddNew={handleAddNew}
                emptyState="No packing entries yet. Click 'Add New' to create one."
            />

            <FormModal
                isOpen={isModalOpen}
                title="Add New Packing Entry"
                fields={[
                    {
                        name: 'yarn_type',
                        label: 'Type',
                        value: selectedYarn || "",
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
                        value: selectedTpm || "",
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
                        value: selectedColor || "",
                        placeholder: 'Select Color',
                        onChange: handleColorChange,
                        options: [...new Set(totalEntries.map(e => e.color))].map(color => ({
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
                            { value: '1500', label: '1500' },
                            { value: '3000', label: '3000' }
                        ]
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
