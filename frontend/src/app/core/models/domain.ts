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
  premiumStartedAt?: string;
  premiumExpiresAt?: string;
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
  fotoPosicionX?: number;
  fotoPosicionY?: number;
  enfermedades?: string[];
  alergias?: string[];
  medicacion?: string[];
  esterilizado?: boolean;
  consentimientoPerfilPublico?: boolean;
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
  owner?: User;
  descripcion: string;
  requisitos: string[];
  ciudad: string;
  estado: string;
}

export interface AdoptionApplication {
  _id: string;
  adoption: Adoption;
  solicitante: User;
  cuestionario: {
    espacio: string;
    experiencia: string;
    recursos: string;
    compromiso: string;
  };
  firmaDigital: string;
  consentimientoPerfilPublico: boolean;
  estado: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt?: string;
}

export interface PremiumRequest {
  _id: string;
  user?: User;
  plan: 'PREMIUM';
  billingPeriod?: 'YEARLY';
  durationMonths?: number;
  price: number;
  currency: string;
  paymentReference: string;
  receipt?: {
    originalName?: string;
    bytes?: number;
  };
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  activatedAt?: string;
  expiresAt?: string;
  createdAt?: string;
}

export interface LostReport {
  _id: string;
  pet: Pet;
  ciudad: string;
  zona?: string;
  descripcion?: string;
  contactoPublico: string;
  estado?: 'LOST' | 'FOUND';
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
