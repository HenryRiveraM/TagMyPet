import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="mx-auto max-w-5xl rounded-lg border border-white/80 bg-white/85 p-6 shadow-xl shadow-slate-200/70 md:p-10">
      <p class="eyebrow">Términos</p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-950">Términos de uso</h1>
      <p class="mt-4 text-slate-600">Estos términos resumen el uso esperado de TagMyPet para identificación NFC, cuidado veterinario, reportes de pérdida y adopciones responsables.</p>
      <p class="mt-3 text-sm font-semibold text-slate-500">Vigentes desde: 23 de mayo de 2026</p>
      <div class="mt-8 space-y-4">
        @for (item of items; track item.title) {
          <article class="rounded-lg border border-stone-200 bg-stone-50 p-5">
            <h2 class="font-bold">{{ item.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.text }}</p>
          </article>
        }
      </div>
      <article class="mt-6 rounded-lg border border-stone-200 bg-stone-50 p-5">
        <h2 class="font-bold">Contacto y solicitudes</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">El responsable y único desarrollador oficial de la página es Henry Rivera Mendez. Para soporte, baja de cuenta o reclamos utiliza <a class="font-bold text-brand" href="mailto:henryriveramendez@gmail.com">henryriveramendez&#64;gmail.com</a> o el teléfono <a class="font-bold text-brand" href="tel:+59176916697">76916697</a>.</p>
      </article>
    </section>
  `
})
export class TermsComponent {
  items = [
    { title: 'Cuenta y veracidad', text: 'El usuario debe proporcionar información real y mantener actualizado el contacto asociado a sus mascotas. No debe usar TagMyPet para actividades engañosas o contrarias al bienestar animal.' },
    { title: 'Perfil NFC y consentimiento', text: 'Al crear el perfil público y grabar el collar, el dueño autoriza la exhibición de fotos, teléfono y datos críticos necesarios para identificar o auxiliar a la mascota. Puede desactivarlo eliminando la mascota o solicitando soporte.' },
    { title: 'Uso veterinario', text: 'Las clínicas deben ser aprobadas por administración. Un veterinario solo registra o consulta información médica de mascotas cuando existe autorización activa del propietario.' },
    { title: 'Reportes y adopciones', text: 'Los reportes de pérdida y postulaciones deben ser verídicos. Al aprobar una adopción, la mascota pasa al nuevo responsable y su teléfono se publica en el NFC solo porque lo autorizó al postular.' },
    { title: 'Planes y activación Premium', text: 'Free incluye funciones básicas y hasta 2 mascotas. Premium se contrata por 840 Bs durante 12 meses (equivalente a 70 Bs/mes), pagados mediante QR boliviano. El periodo empieza cuando el administrador valida el comprobante PDF y finaliza automáticamente al cumplirse la vigencia. La plataforma no procesa tarjetas ni débitos automáticos.' },
    { title: 'Eliminación de cuenta', text: 'El usuario puede pedir baja de cuenta y eliminación de sus datos mediante el contacto oficial. Podremos conservar registros mínimos cuando sean necesarios para atender solicitudes o proteger la seguridad del servicio.' }
  ];
}
