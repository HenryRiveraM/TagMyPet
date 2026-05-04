import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="grid min-h-[72vh] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
      <div>
        <img class="mb-5 h-24 w-24 rounded-lg border border-slate-200 bg-white object-contain shadow-sm" src="/assets/tagmypet-logo.svg" alt="TagMyPet logo">
        <p class="mb-3 text-sm font-semibold uppercase tracking-wide text-brand">Collares NFC para cuidado real</p>
        <h1 class="max-w-3xl text-5xl font-bold leading-tight text-slate-950 md:text-6xl">TagMyPet</h1>
        <p class="mt-5 max-w-2xl text-lg text-slate-600">Historial clínico, adopciones responsables, mascotas perdidas y perfiles públicos seguros en una sola plataforma.</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a routerLink="/register" class="btn">Crear cuenta</a>
          <a routerLink="/perdidos" class="btn-outline">Ver mascotas perdidas</a>
        </div>
      </div>
      <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <img class="h-[460px] w-full object-cover" src="https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=1200&q=80" alt="Mascota con collar">
      </div>
    </section>
    <section class="grid gap-4 md:grid-cols-4">
      @for (item of features; track item.title) {
        <article class="panel">
          <h2 class="font-semibold">{{ item.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ item.text }}</p>
        </article>
      }
    </section>
  `
})
export class HomeComponent {
  features = [
    { title: 'NFC público', text: 'Información crítica visible al escanear el collar.' },
    { title: 'Veterinaria', text: 'Vacunas, tratamientos, alergias y controles.' },
    { title: 'Perdidos', text: 'Reportes públicos con filtros por ciudad.' },
    { title: 'Adopciones', text: 'Cuestionario y firma digital para adopción responsable.' }
  ];
}
