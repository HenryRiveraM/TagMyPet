import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: `
    <section class="mx-auto max-w-4xl rounded-lg border border-white/80 bg-white/85 p-6 shadow-xl shadow-slate-200/70 md:p-10">
      <p class="eyebrow">Términos</p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-950">Términos de uso</h1>
      <p class="mt-4 text-slate-600">Estos términos resumen el uso esperado de TagMyPet para identificación NFC, cuidado veterinario, reportes de pérdida y adopciones responsables.</p>
      <div class="mt-8 space-y-4">
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
export class TermsComponent {
  items = [
    { title: 'Responsabilidad del usuario', text: 'El dueño debe mantener actualizada la información de contacto, salud crítica y estado de la mascota.' },
    { title: 'Uso veterinario', text: 'Las clínicas y veterinarios solo deben registrar información médica cuando tienen autorización correspondiente.' },
    { title: 'Reportes y adopciones', text: 'Los reportes de mascotas perdidas y adopciones deben ser verídicos y orientados al bienestar animal.' },
    { title: 'Planes', text: 'El plan Free permite funciones básicas y Premium habilita gestión ampliada según la descripción comercial vigente.' }
  ];
}
