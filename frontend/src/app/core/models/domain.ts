export type Role = 'ADMIN' | 'OWNER' | 'VETERINARIO';

export interface User {
  id?: string;
  _id?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  ciudad?: string;
  rol: Role;
  estado?: 'ACTIVE' | 'SUSPENDED';
  plan?: 'FREE' | 'PREMIUM';
  emailVerified?: boolean;
}

export interface Pet {
  _id: string;
  nombre: string;
  especie: string;
  raza?: string;
  edad?: number;
  sexo?: string;
  color?: string;
  foto?: string;
  fotos?: string[];
  enfermedades?: string[];
  alergias?: string[];
  medicacion?: string[];
  esterilizado?: boolean;
  codigoNFC: string;
  estado: string;
  propietario?: User;
}

export interface Reminder {
  _id: string;
  pet: Pet;
  tipo: string;
  titulo: string;
  fecha: string;
  completado: boolean;
}

export interface Adoption {
  _id: string;
  pet: Pet;
  descripcion: string;
  requisitos: string[];
  ciudad: string;
  estado: string;
}

export interface LostReport {
  _id: string;
  pet: Pet;
  ciudad: string;
  zona?: string;
  descripcion?: string;
  contactoPublico: string;
}

export interface Clinic {
  _id: string;
  nombre: string;
  nit?: string;
  telefono: string;
  email?: string;
  ciudad: string;
  direccion: string;
  sucursales?: Array<{ nombre?: string; ciudad?: string; direccion?: string; telefono?: string }>;
  estado: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  veterinarios?: User[];
  administradores?: User[];
}

export interface PetAccessRequest {
  _id: string;
  pet: Pet;
  owner: User;
  veterinarian: User;
  clinic?: Clinic;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
}

export interface NfcTag {
  _id: string;
  code: string;
  batch?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'SOLD' | 'DEFECTIVE' | 'DISABLED';
  pet?: Pet;
  owner?: User;
  publicUrl?: string;
  notes?: string;
}
