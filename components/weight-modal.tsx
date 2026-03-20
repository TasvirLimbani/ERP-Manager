'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { X } from 'lucide-react'

interface WeightField {
  name: string
  label: string
  value?: string
  type: 'text' | 'number' | 'date' | 'textarea' | 'select'
  placeholder?: string
  options?: { label: string; value: string }[]
  onChange?: (value: any) => void
  required?: boolean
  readOnly?: boolean
  disabled?: boolean
}

interface WeightModalProps {
  isOpen: boolean
  title: string
  fields: WeightField[]
  dropone?: WeightField[]
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => void
  onClose: () => void
  isLoading?: boolean
}

export function WeightModal({
  isOpen,
  title,
  fields,
  dropone,
  initialData,
  onSubmit,
  onClose,
  isLoading = false,
}: WeightModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [dropFormData, setDropFormData] = useState<Record<string, any>>({})
  const [fieldTypes, setFieldTypes] = useState<Record<string, 'text' | 'select'>>({})
  const [dropFieldTypes, setDropFieldTypes] = useState<Record<string, 'text' | 'select'>>({})

  useEffect(() => {
    const newData: Record<string, any> = {}
    const newTypes: Record<string, 'text' | 'select'> = {}

    fields.forEach((field) => {
      newData[field.name] = initialData?.[field.name] || ''

      if (field.type === 'select') {
        newTypes[field.name] = 'select'
      }
    })

    setFormData(newData)
    setFieldTypes(newTypes)

    // ✅ RESET DROPDOWN DATA WHEN MODAL OPENS
    setDropFormData({})
    setDropFieldTypes({})
  }, [initialData, isOpen, fields])

  if (!isOpen) return null

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleChangedrop = (name: string, value: any) => {
    setDropFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (name: string, type: 'text' | 'select') => {
    setFieldTypes((prev) => ({ ...prev, [name]: type }))
  }
  const handleTypeChangedrop = (name: string, type: 'text' | 'select') => {
    setDropFieldTypes((prev) => ({ ...prev, [name]: type }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <Card className="relative w-full max-w-md border border-border/50 bg-card shadow-lg 
                max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-xl">

        {/* HEADER */}
        <div className="px-6 pb-4 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded-lg transition-colors"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* BODY (SCROLL ONLY HERE) */}
        <div className="px-6 pb-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 👉 KEEP YOUR FULL FORM SAME HERE */}

            {/* your full form content stays SAME */}
            <div className="flex row text-sm font-medium text-foreground mb-2">
              {dropone?.map((field) => (
                <div className="mr-4" key={field.name}>


                  <div >
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>

                    {/* Textarea */}
                    {field.type === 'textarea' ? (
                      <textarea
                        value={dropFormData[field.name] || ''}
                        onChange={(e) => handleChangedrop(field.name, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        rows={4}
                      />
                    ) :
                      /* Select field with dynamic "Other" */
                      field.type === 'select' ? (
                        <select
                          value={field.value ?? dropFormData[field.name] ?? ''} onChange={(e) => {
                            const value = e.target.value
                            handleChangedrop(field.name, value)

                            if (field.onChange && value !== 'other') {
                              field.onChange(value)
                            }

                            if (value === 'other') {
                              handleTypeChangedrop(field.name, 'text')
                              handleChangedrop(field.name, '')
                            }
                          }}
                          className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      ) : (
                        <Input
                          type="text"
                          value={field.value ?? dropFormData[field.name] ?? ''}
                          onChange={(e) => handleChangedrop(field.name, e.target.value)}
                          placeholder={field.placeholder}
                          readOnly={field.readOnly}
                          disabled={field.disabled}
                          className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground"
                        />
                      )}
                  </div>    </div>
              ))}


            </div>
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </label>

                {/* Textarea */}
                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    rows={4}
                  />
                ) :
                  /* Select field with dynamic "Other" */
                  field.type === 'select' && fieldTypes[field.name] === 'select' ? (
                    <select
                      value={field.value ?? formData[field.name] ?? ''}
                      onChange={(e) => {
                        const value = e.target.value

                        handleChange(field.name, value)

                        if (field.onChange) {
                          field.onChange(value)
                        }

                        if (value === 'other') {
                          handleTypeChange(field.name, 'text')
                          handleChange(field.name, '')
                        }
                      }}
                      className="w-full px-3 py-2 bg-background border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select {field.label}</option>
                      {field.options?.map((opt, index) => (
                        <option key={`${opt.value}-${index}`} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <Input
                      type="text"
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      readOnly={field.readOnly}
                      disabled={field.disabled}
                      className="bg-background border-border/50 text-foreground placeholder:text-muted-foreground"
                    />
                  )}
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 border-border/50 bg-background hover:bg-red-500/30 text-foreground"
              >
                Cancel
              </Button>
             
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}