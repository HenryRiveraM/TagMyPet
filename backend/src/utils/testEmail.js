import dotenv from 'dotenv';
import { sendEmail } from './email.js';

dotenv.config();

const to = process.argv[2] || process.env.SMTP_USER;

sendEmail({
  to,
  subject: 'Prueba TagMyPet SMTP',
  text: 'Si recibiste este correo, SMTP está funcionando.',
  html: '<p>Si recibiste este correo, SMTP está funcionando.</p>'
}).then((result) => {
  console.log('Email test result:', result.skipped ? 'skipped' : 'sent');
  process.exit(0);
}).catch((error) => {
  console.error('Email test failed:', error.code || error.name, error.response || error.message);
  process.exit(1);
});
