import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-3xl rounded-lg border border-white/80 bg-white/85 p-8 text-center shadow-xl shadow-slate-200/70 md:p-12">
      <p class="eyebrow">404</p>
      <h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-950">Esta página no existe</h1>
      <p class="mt-4 text-slate-600">El enlace pudo cambiar o el perfil NFC no está disponible. Puedes volver al inicio o revisar mascotas perdidas.</p>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a routerLink="/" class="btn">Volver al inicio</a>
        <a routerLink="/perdidos" class="btn-outline">Ver mascotas perdidas</a>
      </div>
    </section>
  `
})
export class NotFoundComponent {}
