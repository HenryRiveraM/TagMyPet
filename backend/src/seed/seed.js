import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { Adoption } from '../models/Adoption.js';
import { Clinic } from '../models/Clinic.js';
import { LostReport } from '../models/LostReport.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { NfcTag } from '../models/NfcTag.js';
import { Pet } from '../models/Pet.js';
import { PetAccess } from '../models/PetAccess.js';
import { Reminder } from '../models/Reminder.js';
import { User } from '../models/User.js';
import { publicPetUrl } from '../utils/url.js';

dotenv.config();

await connectDB();
await Promise.all([
  User.deleteMany(),
  Pet.deleteMany(),
  MedicalRecord.deleteMany(),
  Reminder.deleteMany(),
  LostReport.deleteMany(),
  Adoption.deleteMany(),
  Clinic.deleteMany(),
  PetAccess.deleteMany(),
  NfcTag.deleteMany()
]);

const [admin, owner, vet] = await User.create([
  { nombre: 'Admin', apellido: 'TagMyPet', email: 'admin@tagmypet.com', password: 'Password123', rol: 'ADMIN', ciudad: 'La Paz', telefono: '+59170000001', plan: 'PREMIUM', emailVerified: true },
  { nombre: 'Lucia', apellido: 'Rojas', email: 'owner@tagmypet.com', password: 'Password123', rol: 'OWNER', ciudad: 'La Paz', telefono: '+59170000002', plan: 'PREMIUM', emailVerified: true },
  { nombre: 'Mateo', apellido: 'Vargas', email: 'vet@tagmypet.com', password: 'Password123', rol: 'VETERINARIO', ciudad: 'Cochabamba', telefono: '+59170000003', emailVerified: true }
]);

const [luna, max] = await Pet.create([
  {
    nombre: 'Luna',
    especie: 'Perro',
    raza: 'Mestiza',
    edad: 3,
    sexo: 'HEMBRA',
    color: 'Dorado',
    foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d',
    enfermedades: ['Ninguna crónica'],
    alergias: ['Polen'],
    medicacion: ['Antihistamínico estacional'],
    esterilizado: true,
    codigoNFC: 'NFC-LUNA-001',
    propietario: owner._id
  },
  {
    nombre: 'Max',
    especie: 'Gato',
    raza: 'Europeo',
    edad: 2,
    sexo: 'MACHO',
    color: 'Gris',
    foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    esterilizado: true,
    codigoNFC: 'NFC-MAX-002',
    propietario: owner._id,
    estado: 'ADOPTION'
  }
]);

await NfcTag.create([
  {
    code: 'NFC-LUNA-001',
    batch: 'LOTE-DEMO-2026',
    status: 'ASSIGNED',
    pet: luna._id,
    owner: owner._id,
    publicUrl: publicPetUrl('NFC-LUNA-001'),
    assignedAt: new Date()
  },
  {
    code: 'NFC-MAX-002',
    batch: 'LOTE-DEMO-2026',
    status: 'ASSIGNED',
    pet: max._id,
    owner: owner._id,
    publicUrl: publicPetUrl('NFC-MAX-002'),
    assignedAt: new Date()
  },
  {
    code: 'TMP-DEMO-003',
    batch: 'LOTE-DEMO-2026',
    status: 'AVAILABLE',
    publicUrl: publicPetUrl('TMP-DEMO-003')
  }
]);

const clinic = await Clinic.create({
  nombre: 'Clínica Veterinaria Norte',
  nit: '1234567018',
  telefono: '+59170000111',
  email: 'contacto@vetnorte.bo',
  ciudad: 'Cochabamba',
  direccion: 'Zona Norte, Av. América',
  estado: 'ACTIVE',
  administradores: [vet._id],
  veterinarios: [vet._id]
});

await PetAccess.create({
  pet: luna._id,
  owner: owner._id,
  veterinarian: vet._id,
  clinic: clinic._id,
  status: 'APPROVED',
  requestedBy: vet._id,
  approvedAt: new Date()
});

await MedicalRecord.create([
  { pet: luna._id, registradoPor: vet._id, tipo: 'VACUNA', titulo: 'Rabia anual', descripcion: 'Aplicada sin reacción adversa.', fecha: new Date(), proximaFecha: new Date(Date.now() + 31536000000) },
  { pet: luna._id, registradoPor: vet._id, tipo: 'CONTROL', titulo: 'Control general', descripcion: 'Peso estable y signos normales.', fecha: new Date() }
]);

await Reminder.create([
  { pet: luna._id, owner: owner._id, tipo: 'VACUNA', titulo: 'Refuerzo rabia', fecha: new Date(Date.now() + 31536000000) },
  { pet: luna._id, owner: owner._id, tipo: 'CONTROL', titulo: 'Chequeo semestral', fecha: new Date(Date.now() + 15552000000) }
]);

await LostReport.create({
  pet: luna._id,
  owner: owner._id,
  ciudad: 'La Paz',
  zona: 'Sopocachi',
  descripcion: 'Vista por última vez cerca de la plaza.',
  contactoPublico: '+59170000002'
});
await Pet.findByIdAndUpdate(luna._id, { estado: 'LOST' });

await Adoption.create({
  pet: max._id,
  owner: owner._id,
  descripcion: 'Max busca una familia tranquila con experiencia en gatos.',
  requisitos: ['Ambiente seguro', 'Seguimiento veterinario'],
  ciudad: 'La Paz'
});

console.log('Seed completo');
console.log('Credenciales: admin/owner/vet @tagmypet.com con Password123');
console.log(`Usuarios creados: ${admin.email}, ${owner.email}, ${vet.email}`);
process.exit(0);
