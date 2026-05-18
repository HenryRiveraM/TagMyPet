import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mb-6 overflow-hidden rounded-lg border border-white/80 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/50 md:p-8">
      <p class="eyebrow text-stone-200">Panel de control</p>
      <div class="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight md:text-4xl">Hola, {{ auth.user()?.nombre }}</h1>
          <div class="mt-3 flex flex-wrap gap-2">
            <span class="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-white">{{ roleLabel(auth.user()?.rol) }}</span>
            <span class="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-white">Plan {{ planLabel(auth.user()?.plan) }}</span>
          </div>
        </div>
        @if (auth.user()?.rol === 'ADMIN') {
          <button class="btn bg-white text-slate-950 hover:bg-stone-100" (click)="sendReminderNotifications()">Enviar recordatorios próximos</button>
        }
      </div>
      @if (!auth.user()?.emailVerified) {
        <div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tu email todavía no está verificado.
          <button class="ml-2 font-semibold text-amber-950 underline" (click)="resendVerification()">Reenviar verificación</button>
          @if (message) { <span class="ml-2">{{ message }}</span> }
        </div>
      }
    </section>
    <section class="grid gap-4 md:grid-cols-3">
      @for (item of visibleCards(); track item.href) {
        <a [routerLink]="item.href" class="panel min-h-40 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
          <span class="badge">{{ item.tag }}</span>
          <h2 class="mt-5 text-lg font-semibold">{{ item.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ item.text }}</p>
        </a>
      }
    </section>
  `
})
export class DashboardComponent {
  message = '';
  constructor(public auth: AuthService, private api: ApiService) {}

  roleLabel(role?: string) {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      OWNER: 'Dueño',
      VETERINARIO: 'Veterinario'
    };
    return labels[role || ''] || 'Usuario';
  }

  planLabel(plan?: string) {
    const labels: Record<string, string> = { FREE: 'Free', PREMIUM: 'Premium' };
    return labels[plan || ''] || 'Free';
  }

  visibleCards() {
    const role = this.auth.user()?.rol;
    const cards = [
      { tag: 'NFC', title: 'Mis mascotas', text: 'Registra perfiles NFC y datos críticos.', href: '/mascotas', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { tag: 'Salud', title: 'Historial', text: 'Vacunas, tratamientos y controles.', href: '/historial', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { tag: 'Alertas', title: 'Recordatorios', text: 'Alertas de vacunas y medicación.', href: '/recordatorios', roles: ['ADMIN', 'OWNER'] },
      { tag: 'Clínicas', title: 'Clínicas', text: 'Veterinarias asociadas y autorizaciones.', href: '/clinicas', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { tag: 'Lotes', title: 'Tags NFC', text: 'Inventario, lotes y asignación física.', href: '/tags-nfc', roles: ['ADMIN', 'OWNER'] },
      { tag: 'Hogar', title: 'Adopciones', text: 'Publica o solicita adopciones.', href: '/adopciones', roles: ['ADMIN', 'OWNER'] },
      { tag: 'Mapa', title: 'Perdidos', text: 'Reportes públicos y encontrados.', href: '/perdidos', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { tag: 'Admin', title: 'Admin', text: 'Usuarios, moderación y estadísticas.', href: '/admin', roles: ['ADMIN'] }
    ];
    return cards.filter((card) => role && card.roles.includes(role));
  }

  resendVerification() {
    this.auth.resendVerification().subscribe((res) => this.message = res.message);
  }

  sendReminderNotifications() {
    this.api.sendReminderNotifications().subscribe((res) => this.message = `Recordatorios enviados: ${res.sent}`);
  }
}
