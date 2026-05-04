import { body } from 'express-validator';
import { roles } from '../models/User.js';

export const registerRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
  body('apellido').trim().notEmpty().withMessage('Apellido requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Password mínimo 8 caracteres'),
  body('rol').optional().isIn(roles).withMessage('Rol inválido')
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Password requerido')
];

export const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Email inválido')
];

export const resetPasswordRules = [
  body('password').isLength({ min: 8 }).withMessage('Password mínimo 8 caracteres')
];

export const petRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre de mascota requerido'),
  body('especie').trim().notEmpty().withMessage('Especie requerida'),
  body('edad').optional().isNumeric().withMessage('Edad inválida')
];

export const medicalRules = [
  body('pet').isMongoId().withMessage('Mascota inválida'),
  body('tipo').isIn(['VACUNA', 'TRATAMIENTO', 'CIRUGIA', 'ALERGIA', 'CONTROL']).withMessage('Tipo inválido'),
  body('titulo').trim().notEmpty().withMessage('Título requerido'),
  body('fecha').isISO8601().withMessage('Fecha inválida')
];

export const reminderRules = [
  body('pet').isMongoId().withMessage('Mascota inválida'),
  body('tipo').isIn(['VACUNA', 'MEDICACION', 'CONTROL']).withMessage('Tipo inválido'),
  body('titulo').trim().notEmpty().withMessage('Título requerido'),
  body('fecha').isISO8601().withMessage('Fecha inválida')
];

export const lostRules = [
  body('pet').isMongoId().withMessage('Mascota inválida'),
  body('ciudad').trim().notEmpty().withMessage('Ciudad requerida'),
  body('contactoPublico').trim().notEmpty().withMessage('Contacto requerido')
];

export const adoptionRules = [
  body('pet').isMongoId().withMessage('Mascota inválida'),
  body('descripcion').trim().notEmpty().withMessage('Descripción requerida'),
  body('ciudad').trim().notEmpty().withMessage('Ciudad requerida')
];

export const applicationRules = [
  body('cuestionario.espacio').trim().notEmpty().withMessage('Espacio requerido'),
  body('cuestionario.experiencia').trim().notEmpty().withMessage('Experiencia requerida'),
  body('cuestionario.recursos').trim().notEmpty().withMessage('Recursos requeridos'),
  body('cuestionario.compromiso').trim().notEmpty().withMessage('Compromiso requerido'),
  body('firmaDigital').trim().notEmpty().withMessage('Firma digital requerida')
];

export const clinicRules = [
  body('nombre').trim().notEmpty().withMessage('Nombre de clínica requerido'),
  body('telefono').trim().notEmpty().withMessage('Teléfono requerido'),
  body('ciudad').trim().notEmpty().withMessage('Ciudad requerida'),
  body('direccion').trim().notEmpty().withMessage('Dirección requerida'),
  body('email').optional({ values: 'falsy' }).isEmail().normalizeEmail().withMessage('Email inválido')
];

export const petAccessRules = [
  body('pet').optional({ values: 'falsy' }).isMongoId().withMessage('Mascota inválida'),
  body('nfcCode').optional({ values: 'falsy' }).trim().isLength({ min: 4 }).withMessage('Código NFC inválido'),
  body('clinic').optional({ values: 'falsy' }).isMongoId().withMessage('Clínica inválida')
];

export const petAccessDecisionRules = [
  body('status').isIn(['APPROVED', 'REJECTED', 'REVOKED']).withMessage('Estado de acceso inválido')
];

export const tagRules = [
  body('code').optional({ values: 'falsy' }).trim().isLength({ min: 4 }).withMessage('Código NFC inválido'),
  body('status').optional().isIn(['AVAILABLE', 'SOLD', 'DEFECTIVE', 'DISABLED']).withMessage('Estado de tag inválido')
];

export const tagBatchRules = [
  body('quantity').isInt({ min: 1, max: 200 }).withMessage('Cantidad debe estar entre 1 y 200')
];
