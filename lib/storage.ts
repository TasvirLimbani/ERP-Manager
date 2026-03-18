import type { YarnEntry, TPMEntry, DyeingEntry, ConningEntry, PackingEntry, StockEntry } from './types'

// Mock data storage using localStorage
const STORAGE_KEYS = {
  yarn: 'factory-yarn-data',
  tpm: 'factory-tpm-data',
  dyeing: 'factory-dyeing-data',
  conning: 'factory-conning-data',
  packing: 'factory-packing-data',
  stock: 'factory-stock-data',
}

export const storage = {
  yarn: {
    getAll: (): YarnEntry[] => {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(STORAGE_KEYS.yarn)
      return data ? JSON.parse(data) : []
    },
    add: (entry: YarnEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.yarn.getAll()
      localStorage.setItem(STORAGE_KEYS.yarn, JSON.stringify([...data, entry]))
    },
    update: (id: string, entry: YarnEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.yarn.getAll()
      const index = data.findIndex(d => d.id === id)
      if (index > -1) {
        data[index] = entry
        localStorage.setItem(STORAGE_KEYS.yarn, JSON.stringify(data))
      }
    },
    delete: (id: string) => {
      if (typeof window === 'undefined') return
      const data = storage.yarn.getAll()
      localStorage.setItem(STORAGE_KEYS.yarn, JSON.stringify(data.filter(d => d.id !== id)))
    },
  },
  tpm: {
    getAll: (): TPMEntry[] => {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(STORAGE_KEYS.tpm)
      return data ? JSON.parse(data) : []
    },
    add: (entry: TPMEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.tpm.getAll()
      localStorage.setItem(STORAGE_KEYS.tpm, JSON.stringify([...data, entry]))
    },
    update: (id: string, entry: TPMEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.tpm.getAll()
      const index = data.findIndex(d => d.id === id)
      if (index > -1) {
        data[index] = entry
        localStorage.setItem(STORAGE_KEYS.tpm, JSON.stringify(data))
      }
    },
    delete: (id: string) => {
      if (typeof window === 'undefined') return
      const data = storage.tpm.getAll()
      localStorage.setItem(STORAGE_KEYS.tpm, JSON.stringify(data.filter(d => d.id !== id)))
    },
  },
  dyeing: {
    getAll: (): DyeingEntry[] => {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(STORAGE_KEYS.dyeing)
      return data ? JSON.parse(data) : []
    },
    add: (entry: DyeingEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.dyeing.getAll()
      localStorage.setItem(STORAGE_KEYS.dyeing, JSON.stringify([...data, entry]))
    },
    update: (id: string, entry: DyeingEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.dyeing.getAll()
      const index = data.findIndex(d => d.id === id)
      if (index > -1) {
        data[index] = entry
        localStorage.setItem(STORAGE_KEYS.dyeing, JSON.stringify(data))
      }
    },
    delete: (id: string) => {
      if (typeof window === 'undefined') return
      const data = storage.dyeing.getAll()
      localStorage.setItem(STORAGE_KEYS.dyeing, JSON.stringify(data.filter(d => d.id !== id)))
    },
  },
  conning: {
    getAll: (): ConningEntry[] => {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(STORAGE_KEYS.conning)
      return data ? JSON.parse(data) : []
    },
    add: (entry: ConningEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.conning.getAll()
      localStorage.setItem(STORAGE_KEYS.conning, JSON.stringify([...data, entry]))
    },
    update: (id: string, entry: ConningEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.conning.getAll()
      const index = data.findIndex(d => d.id === id)
      if (index > -1) {
        data[index] = entry
        localStorage.setItem(STORAGE_KEYS.conning, JSON.stringify(data))
      }
    },
    delete: (id: string) => {
      if (typeof window === 'undefined') return
      const data = storage.conning.getAll()
      localStorage.setItem(STORAGE_KEYS.conning, JSON.stringify(data.filter(d => d.id !== id)))
    },
  },
  packing: {
    getAll: (): PackingEntry[] => {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(STORAGE_KEYS.packing)
      return data ? JSON.parse(data) : []
    },
    add: (entry: PackingEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.packing.getAll()
      localStorage.setItem(STORAGE_KEYS.packing, JSON.stringify([...data, entry]))
    },
    update: (id: string, entry: PackingEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.packing.getAll()
      const index = data.findIndex(d => d.id === id)
      if (index > -1) {
        data[index] = entry
        localStorage.setItem(STORAGE_KEYS.packing, JSON.stringify(data))
      }
    },
    delete: (id: string) => {
      if (typeof window === 'undefined') return
      const data = storage.packing.getAll()
      localStorage.setItem(STORAGE_KEYS.packing, JSON.stringify(data.filter(d => d.id !== id)))
    },
  },
  stock: {
    getAll: (): StockEntry[] => {
      if (typeof window === 'undefined') return []
      const data = localStorage.getItem(STORAGE_KEYS.stock)
      return data ? JSON.parse(data) : []
    },
    add: (entry: StockEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.stock.getAll()
      localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify([...data, entry]))
    },
    update: (id: string, entry: StockEntry) => {
      if (typeof window === 'undefined') return
      const data = storage.stock.getAll()
      const index = data.findIndex(d => d.id === id)
      if (index > -1) {
        data[index] = entry
        localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify(data))
      }
    },
    delete: (id: string) => {
      if (typeof window === 'undefined') return
      const data = storage.stock.getAll()
      localStorage.setItem(STORAGE_KEYS.stock, JSON.stringify(data.filter(d => d.id !== id)))
    },
  },
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}
