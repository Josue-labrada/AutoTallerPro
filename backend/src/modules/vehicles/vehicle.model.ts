/** Vehículo tal como lo recibe y devuelve la API. */
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  /** AAAA-MM-DD */
  receptionDate: string;
  notes: string;
}

export type NewVehicle = Omit<Vehicle, 'id'>;
