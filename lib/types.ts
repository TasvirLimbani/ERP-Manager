export type Section = 'dashboard' | 'yarn' | 'tpm' | 'dyeing' | 'conning' | 'packing' | 'stock'

export interface YarnEntry {
  id: string
  company_id: string
  admin_id: string
  batch_id: string
  supplier_name: string
  created_at: string
  weight: string
  yarn_type: string
}

export interface YarnTotalEntry {
  yarn_type: string
  total_weight: string
}

export interface TPMEntry {
  id: string
  date: string
  tpmValue: number
  operator: string
  machineId: string
  notes: string
}

// export interface DyeingEntry {
//   id: string
//   date: string
//   dyeColor: string
//   quantity: number
//   batch: string
//   output_weight: string
// }

export interface DyeingEntry  {
  id: string
  machine_id: string
  yarn_type: string
  company_id: string
  admin_id: string
  color: string
  created_at: string
  tpm: any
  weight: any
  output_weight: any
  status: string
}

export interface ConningEntry {
  id: string
  company_id: string
  machine_id: string
  tpm: any
  yarn_type: string
  color: string
  date: string
  weight: any
  cones: any
  cones_size: string
 
}

export interface PackingEntry {
  id: string
  created_at: string
  yarn_type: string
  tpm: any
  cones: string
  color: any
  cone_size: string
  box: any
  company_id: string
  extra_pis: any
  machine_id: string
}


export interface SellingEntry {
  id: string
  tpm: string
  yarn_type: string
  color: string
  cone_size: string
  box: string
  cones: string
  extra_cones: string
  total_cones: string
  created_at: string
}
export interface StockEntry {
  id: string
  tpm: string
  yarn_type: string
 color: string
 dyeing_weight: string
 coning_weight: string
 remaining_weight: string
 total_cones: string
 packed_cones: string
 remaining_cones: string
 total_box: string
 total_extra_pis: string
}

export type DataEntry = 
  | YarnEntry 
  | TPMEntry 
  | DyeingEntry 
  | ConningEntry 
  | PackingEntry 
  | StockEntry

export interface DashboardStats {
  totalYarn: number
  totalProduction: number
  averageTPM: number
  completedBatches: number
}
