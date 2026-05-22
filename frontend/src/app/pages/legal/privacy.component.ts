import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="mx-auto max-w-4xl rounded-lg border border-white/80 bg-white/85 p-6 shadow-xl shadow-slate-200/70 md:p-10">
      <p class="eyebrow">Privacidad</p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-950">Política de privacidad</h1>
      <p class="mt-4 text-slate-600">TagMyPet protege la información de dueños, mascotas y clínicas usando perfiles públicos limitados y acceso privado por roles.</p>
      <div class="mt-8 grid gap-4 md:grid-cols-2">
        @for (item of items; track item.title) {
          <article class="rounded-lg border border-stone-200 bg-stone-50 p-5">
            <h2 class="font-bold">{{ item.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">{{ item.text }}</p>
          </article>
        }
      </div>
    </section>
  `
})
export class PrivacyComponent {
  items = [
    { title: 'Datos públicos', text: 'El perfil NFC muestra solo datos críticos para identificación, contacto y emergencia.' },
    { title: 'Datos privados', text: 'Historial médico, administración de clínicas y acciones sensibles requieren inicio de sesión y permisos por rol.' },
    { title: 'Imágenes', text: 'Las fotos se usan para identificar a la mascota y mejorar el contacto en casos de pérdida o adopción.' },
    { title: 'Seguridad', text: 'Las credenciales se protegen con hash y la API usa JWT, validaciones y control de acceso.' }
  ];
}
