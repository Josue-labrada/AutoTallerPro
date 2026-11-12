/** Vehículo registrado en el taller. */
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  /** Fecha de recepción en formato AAAA-MM-DD. */
  receptionDate: string;
  notes: string;
}

/** Datos tal como se escriben en el formulario (todo texto). */
export interface VehicleFormValues {
  plate: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  receptionDate: string;
  notes: string;
}

export type VehicleFormErrors = Partial<Record<keyof VehicleFormValues, string>>;
