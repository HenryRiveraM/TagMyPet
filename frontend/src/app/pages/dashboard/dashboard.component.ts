import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold">Hola, {{ auth.user()?.nombre }}</h1>
      <p class="mt-1 text-slate-600">Rol {{ auth.user()?.rol }} · Plan {{ auth.user()?.plan || 'FREE' }}</p>
      @if (!auth.user()?.emailVerified) {
        <div class="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Tu email todavía no está verificado.
          <button class="ml-2 font-semibold text-amber-950 underline" (click)="resendVerification()">Reenviar verificación</button>
          @if (message) { <span class="ml-2">{{ message }}</span> }
        </div>
      }
      @if (auth.user()?.rol === 'ADMIN') {
        <button class="btn-outline mt-4" (click)="sendReminderNotifications()">Enviar recordatorios próximos</button>
      }
    </section>
    <section class="grid gap-4 md:grid-cols-3">
      @for (item of visibleCards(); track item.href) {
        <a [routerLink]="item.href" class="panel transition hover:-translate-y-0.5 hover:border-brand">
          <h2 class="font-semibold">{{ item.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ item.text }}</p>
        </a>
      }
    </section>
  `
})
export class DashboardComponent {
  message = '';
  constructor(public auth: AuthService, private api: ApiService) {}

  visibleCards() {
    const role = this.auth.user()?.rol;
    const cards = [
      { title: 'Mascotas', text: 'Registra perfiles NFC y datos críticos.', href: '/mascotas', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { title: 'Historial', text: 'Vacunas, tratamientos y controles.', href: '/historial', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { title: 'Recordatorios', text: 'Alertas de vacunas y medicación.', href: '/recordatorios', roles: ['ADMIN', 'OWNER'] },
      { title: 'Clínicas', text: 'Veterinarias asociadas y autorizaciones.', href: '/clinicas', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { title: 'Tags NFC', text: 'Inventario, lotes y asignación física.', href: '/tags-nfc', roles: ['ADMIN', 'OWNER'] },
      { title: 'Adopciones', text: 'Publica o solicita adopciones.', href: '/adopciones', roles: ['ADMIN', 'OWNER', 'ADOPTANTE'] },
      { title: 'Perdidos', text: 'Reportes públicos y encontrados.', href: '/perdidos', roles: ['ADMIN', 'OWNER', 'ADOPTANTE', 'VETERINARIO'] },
      { title: 'Admin', text: 'Usuarios, moderación y estadísticas.', href: '/admin', roles: ['ADMIN'] }
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
