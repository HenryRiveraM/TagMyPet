import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="relative grid min-h-[72vh] items-center gap-10 overflow-hidden rounded-lg border border-white/80 bg-white/75 p-6 shadow-xl shadow-slate-200/80 md:p-10 lg:grid-cols-[1.02fr_.98fr]">
      <div class="relative z-10">
        <img class="mb-6 h-32 w-32 object-contain" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
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
    <section class="mt-6 rounded-lg border border-white/80 bg-white/80 p-6 shadow-xl shadow-slate-200/70 md:p-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Planes de pago</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Elige cómo cuidar a tus mascotas</h2>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Empieza gratis y activa Premium cuando necesites más mascotas, más historial y una gestión completa.</p>
        </div>
        <span class="badge w-fit">Sin contratos</span>
      </div>

      <div class="mt-6 grid gap-4 lg:grid-cols-2">
        <article class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-2xl font-bold text-slate-950">Free</h3>
              <p class="mt-1 text-sm text-slate-600">Para probar TagMyPet y manejar lo esencial.</p>
            </div>
            <p class="text-right text-3xl font-bold text-slate-950">0 Bs</p>
          </div>
          <ul class="mt-6 space-y-3 text-sm text-slate-700">
            @for (item of freePlan; track item) {
              <li class="flex gap-3"><span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand"></span><span>{{ item }}</span></li>
            }
          </ul>
          <a routerLink="/register" class="btn-outline mt-6 w-full">Crear cuenta gratis</a>
        </article>

        <article class="relative overflow-hidden rounded-lg border border-brand bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300/70">
          <div class="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gold/30 blur-3xl"></div>
          <div class="relative flex items-start justify-between gap-4">
            <div>
              <span class="rounded-md bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-stone-200">Recomendado</span>
              <h3 class="mt-4 text-2xl font-bold">Premium</h3>
              <p class="mt-1 text-sm text-stone-300">Para dueños que quieren gestión completa.</p>
            </div>
            <div class="text-right">
              <p class="text-4xl font-bold">70 Bs</p>
              <p class="mt-1 text-sm text-stone-300">/ mes</p>
            </div>
          </div>
          <ul class="relative mt-6 space-y-3 text-sm text-stone-100">
            @for (item of premiumPlan; track item) {
              <li class="flex gap-3"><span class="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold"></span><span>{{ item }}</span></li>
            }
          </ul>
          <a routerLink="/register" class="mt-6 inline-flex min-h-10 w-full items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:bg-stone-100">Activar Premium</a>
        </article>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit() {
    if (this.auth.user()) this.router.navigateByUrl('/dashboard');
  }

  metrics = [
    { value: 'NFC', label: 'identificación' },
    { value: '24/7', label: 'perfil público' },
    { value: '3 roles', label: 'operación' }
  ];

  features = [
    { tag: 'NFC', title: 'Perfil público', text: 'Información crítica visible al escanear el collar.' },
    { tag: 'Salud', title: 'Veterinaria', text: 'Vacunas, tratamientos, alergias y controles.' },
    { tag: 'Alerta', title: 'Perdidos', text: 'Reportes públicos con filtros por ciudad.' },
    { tag: 'Hogar', title: 'Adopciones', text: 'Cuestionario y firma digital para adopción responsable.' }
  ];

  freePlan = [
    'Hasta 2 mascotas registradas',
    'Perfil NFC público por mascota',
    'Datos críticos visibles para emergencias',
    'Reporte básico de mascota perdida'
  ];

  premiumPlan = [
    'Mascotas ilimitadas',
    'Historial clínico completo',
    'Recordatorios de vacunas, medicación y controles',
    'Hasta 5 fotos por mascota',
    'Gestión de adopciones y reportes perdidos',
    'Acceso veterinario autorizado por mascota',
    'Preparado para beneficios y pagos futuros'
  ];
}
