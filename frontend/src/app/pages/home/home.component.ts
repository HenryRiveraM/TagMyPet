import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative grid min-h-[72vh] items-center gap-10 overflow-hidden rounded-lg border border-white/80 bg-white/75 p-6 shadow-xl shadow-slate-200/80 md:p-10 lg:grid-cols-[1.02fr_.98fr]">
      <div class="relative z-10">
        <img class="mb-6 h-20 w-20 rounded-lg border border-slate-200 bg-white object-contain p-2 shadow-sm" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
        <p class="eyebrow">Collares NFC para cuidado real</p>
        <h1 class="mt-3 max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">TagMyPet</h1>
        <p class="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Historial clínico, adopciones responsables, mascotas perdidas y perfiles públicos seguros en una sola plataforma.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/register" class="btn">Crear cuenta</a>
          <a routerLink="/perdidos" class="btn-outline">Ver mascotas perdidas</a>
        </div>
        <div class="mt-8 grid max-w-xl grid-cols-3 gap-3">
          @for (metric of metrics; track metric.label) {
            <div class="rounded-lg border border-slate-100 bg-white/80 p-4 shadow-sm">
              <p class="text-2xl font-bold text-slate-950">{{ metric.value }}</p>
              <p class="mt-1 text-xs font-semibold text-slate-500">{{ metric.label }}</p>
            </div>
          }
        </div>
      </div>
      <div class="relative">
        <img class="aspect-[4/5] max-h-[560px] w-full rounded-lg object-cover shadow-2xl shadow-slate-300/60" src="https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1200&q=80" alt="Mascota con collar">
        <div class="absolute bottom-4 left-4 right-4 rounded-lg border border-white/60 bg-white/90 p-4 shadow-lg backdrop-blur">
          <p class="text-sm font-bold text-slate-950">Perfil NFC público</p>
          <p class="mt-1 text-sm text-slate-600">Datos críticos visibles sin exponer información privada.</p>
        </div>
      </div>
    </section>
    <section class="mt-6 grid gap-4 md:grid-cols-4">
      @for (item of features; track item.title) {
        <article class="panel transition hover:-translate-y-0.5 hover:border-brand">
          <span class="badge">{{ item.tag }}</span>
          <h2 class="mt-4 font-semibold">{{ item.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ item.text }}</p>
        </article>
      }
    </section>
  `
})
export class HomeComponent {
  metrics = [
    { value: 'NFC', label: 'identificación' },
    { value: '24/7', label: 'perfil público' },
    { value: '4 roles', label: 'operación' }
  ];

  features = [
    { tag: 'NFC', title: 'Perfil público', text: 'Información crítica visible al escanear el collar.' },
    { tag: 'Salud', title: 'Veterinaria', text: 'Vacunas, tratamientos, alergias y controles.' },
    { tag: 'Alerta', title: 'Perdidos', text: 'Reportes públicos con filtros por ciudad.' },
    { tag: 'Hogar', title: 'Adopciones', text: 'Cuestionario y firma digital para adopción responsable.' }
  ];
}
