import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="mx-auto max-w-5xl rounded-lg border border-white/80 bg-white/85 p-6 shadow-xl shadow-slate-200/70 md:p-10">
      <p class="eyebrow">Privacidad</p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-950">Política de privacidad</h1>
      <p class="mt-4 max-w-3xl text-slate-600">TagMyPet protege la información de dueños, mascotas y clínicas mediante perfiles NFC públicos limitados y acceso privado controlado por roles y autorizaciones.</p>
      <p class="mt-3 text-sm font-semibold text-slate-500">Vigente desde: 23 de mayo de 2026</p>
      <article class="mt-8 rounded-lg border border-stone-200 bg-stone-50 p-5">
        <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Responsable y contacto oficial</p>
        <h2 class="mt-2 text-xl font-bold">Henry Rivera Mendez · Desarrollador oficial de TagMyPet</h2>
        <div class="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
          <a class="btn-outline" href="tel:+59176916697">Llamar: 76916697</a>
          <a class="btn-outline" href="mailto:henryriveramendez@gmail.com">henryriveramendez&#64;gmail.com</a>
        </div>
      </article>
      <div class="mt-8 grid gap-4 md:grid-cols-2">
        @for (item of items; track item.title) {
          <article class="rounded-lg border border-stone-200 bg-stone-50 p-5">
            <h2 class="font-bold">{{ item.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.text }}</p>
          </article>
        }
      </div>
      <article class="mt-6 rounded-lg border border-brand/20 bg-white p-6">
        <h2 class="text-xl font-bold">Eliminación y actualización de datos</h2>
        <p class="mt-2 text-sm leading-6 text-slate-600">Puedes solicitar corrección o eliminación de tu cuenta, mascotas, fotos y datos asociados escribiendo al correo oficial o llamando al número indicado. Para protegerte, podremos pedir verificación de identidad antes de eliminar información. Al eliminar una mascota, su perfil NFC deja de estar disponible.</p>
      </article>
    </section>
  `
})
export class PrivacyComponent {
  items = [
    { title: 'Datos que tratamos', text: 'Nombre, email, teléfono, ciudad, rol, mascotas, fotos, información de salud registrada, reportes, adopciones, clínicas y solicitudes de plan Premium, incluido el comprobante PDF de pago cuando el usuario solicita activación.' },
    { title: 'Comprobantes Premium', text: 'El comprobante bancario se almacena de forma privada y el sistema entrega a administración un enlace temporal de revisión para verificar el pago. Ese enlace no debe compartirse. El PDF no se publica en perfiles ni listados.' },
    { title: 'Finalidad', text: 'Usamos los datos para identificar mascotas, facilitar contactos de emergencia, gestionar historiales autorizados, adopciones, clínicas, recordatorios y soporte.' },
    { title: 'Consentimiento NFC público', text: 'Al registrar una mascota y activar su collar, el dueño acepta que sus fotos, nombre, datos críticos y teléfono de contacto se publiquen en el perfil NFC para emergencias.' },
    { title: 'Datos privados y permisos', text: 'El historial completo y la gestión interna requieren sesión. Un veterinario solo puede acceder a una mascota con autorización aprobada por el dueño o admin.' },
    { title: 'Fotos e identificación', text: 'Las imágenes se almacenan para reconocer a la mascota en NFC, pérdidas o adopciones. El dueño puede ajustar el encuadre visible o solicitar su eliminación.' },
    { title: 'Seguridad y conservación', text: 'Las contraseñas se almacenan cifradas mediante hash, la API utiliza tokens con expiración y los datos se conservan mientras la cuenta o la finalidad permanezcan activas.' }
  ];
}
