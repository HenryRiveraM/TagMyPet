import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Clinic, Pet, PremiumRequest, Reminder } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="mb-5 overflow-hidden rounded-lg border border-white/80 bg-slate-950 p-5 text-white shadow-xl shadow-slate-300/50 sm:p-6 md:mb-6 md:p-8">
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
          <button class="btn w-full bg-white text-slate-950 hover:bg-stone-100 sm:w-auto" (click)="sendReminderNotifications()">Enviar recordatorios próximos</button>
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
    @if (auth.user()?.rol === 'OWNER') {
      <section class="mb-5 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:p-5 md:mb-6 md:p-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p class="eyebrow">Plan de cuenta</p>
            @if (auth.user()?.plan === 'PREMIUM') {
              <h2 class="mt-2 text-2xl font-bold">Premium activo</h2>
              <p class="mt-2 text-sm text-slate-600">Incluye alertas NFC, álbum de 12 fotos, carteles e historial PDF y prioridad en búsquedas. @if (auth.user()?.premiumExpiresAt) { Vigente hasta el {{ auth.user()?.premiumExpiresAt | date:'longDate' }}. }</p>
            } @else {
              <h2 class="mt-2 text-2xl font-bold">Activar Premium · 840 Bs/año</h2>
              <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">Paga mediante QR boliviano, adjunta tu comprobante PDF y recibe 12 meses desde su aprobación.</p>
            }
          </div>
          @if (latestPremiumRequest(); as request) {
            <span class="rounded-md px-3 py-2 text-sm font-bold" [class.bg-amber-100]="request.status === 'PENDING'" [class.text-amber-800]="request.status === 'PENDING'" [class.bg-emerald-100]="request.status === 'APPROVED'" [class.text-emerald-800]="request.status === 'APPROVED'" [class.bg-red-100]="request.status === 'REJECTED'" [class.text-red-800]="request.status === 'REJECTED'">Solicitud: {{ premiumStatus(request.status) }}</span>
          }
        </div>
        <a routerLink="/premium" class="btn mt-5 w-full sm:w-auto">{{ auth.user()?.plan === 'PREMIUM' ? 'Ver mi vigencia Premium' : hasPendingPremium() ? 'Ver solicitud y pago' : 'Pagar con QR y activar' }}</a>
      </section>
    }
    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      @if (loading()) {
        @for (item of [1,2,3]; track item) {
          <article class="panel min-h-40 animate-pulse"><div class="h-5 w-24 rounded bg-stone-100"></div><div class="mt-5 h-5 w-1/2 rounded bg-stone-100"></div><div class="mt-3 h-4 w-2/3 rounded bg-stone-100"></div></article>
        }
      }
      @for (item of visibleCards(); track item.href) {
        <a [routerLink]="item.href" class="panel min-h-40 transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md">
          <span class="badge">{{ item.tag }}</span>
          <h2 class="mt-5 text-lg font-semibold">{{ item.title }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ item.text }}</p>
        </a>
      }
    </section>
    <section class="mt-6 grid gap-4 lg:grid-cols-3">
      <article class="panel lg:col-span-2">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="eyebrow">Acciones rápidas</p>
            <h2 class="mt-2 text-xl font-bold">Lo más importante hoy</h2>
          </div>
          <span class="badge">{{ pets().length }} mascotas</span>
        </div>
        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          @for (action of quickActions(); track action.href) {
            <a [routerLink]="action.href" class="rounded-lg border border-stone-200 bg-stone-50 p-4 transition hover:-translate-y-0.5 hover:border-brand hover:bg-white">
              <p class="text-sm font-bold text-slate-950">{{ action.title }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ action.text }}</p>
            </a>
          }
        </div>
      </article>
      <article class="panel">
        <p class="eyebrow">Recordatorios próximos</p>
        <h2 class="mt-2 text-xl font-bold">Alertas</h2>
        @if (upcomingReminders().length) {
          <div class="mt-4 space-y-3">
            @for (reminder of upcomingReminders(); track reminder._id) {
              <div class="rounded-lg border border-stone-200 bg-white p-3">
                <p class="text-sm font-bold">{{ reminder.titulo }}</p>
                <p class="mt-1 text-xs text-slate-600">{{ reminder.pet.nombre }} · {{ reminder.fecha | date }}</p>
              </div>
            }
          </div>
        } @else {
          <div class="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">
            No hay recordatorios próximos.
            @if (auth.user()?.rol !== 'VETERINARIO') { <a routerLink="/recordatorios" class="mt-3 inline-flex font-bold text-brand">Crear recordatorio</a> }
          </div>
        }
      </article>
    </section>
    <section class="mt-6 grid gap-4 md:grid-cols-2">
      <article class="panel">
        <p class="eyebrow">NFC</p>
        <h2 class="mt-2 text-xl font-bold">Perfiles listos para collar</h2>
        @if (pets().length) {
          <div class="mt-4 space-y-3">
            @for (pet of pets().slice(0, 3); track pet._id) {
              <div class="flex items-center justify-between gap-3 rounded-lg bg-stone-50 p-3">
                <div>
                  <p class="font-bold">{{ pet.nombre }}</p>
                  <p class="text-xs text-slate-600">{{ pet.especie }} · {{ pet.codigoNFC }}</p>
                </div>
                <a class="btn-outline" [routerLink]="['/pet/public', pet.codigoNFC]">Ver</a>
              </div>
            }
          </div>
        } @else {
          <div class="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">
            Registra tu primera mascota para generar su perfil NFC.
            <a routerLink="/mascotas" class="mt-3 inline-flex font-bold text-brand">Registrar mascota</a>
          </div>
        }
      </article>
      <article class="panel">
        <p class="eyebrow">Clínicas autorizadas</p>
        <h2 class="mt-2 text-xl font-bold">Red veterinaria</h2>
        @if (activeClinics().length) {
          <div class="mt-4 space-y-3">
            @for (clinic of activeClinics().slice(0, 3); track clinic._id) {
              <div class="rounded-lg bg-stone-50 p-3">
                <p class="font-bold">{{ clinic.nombre }}</p>
                <p class="text-xs text-slate-600">{{ clinic.ciudad }} · {{ clinic.telefono }}</p>
              </div>
            }
          </div>
        } @else {
          <div class="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">
            Todavía no hay clínicas oficiales activas.
            <a routerLink="/clinicas" class="mt-3 inline-flex font-bold text-brand">Ver clínicas</a>
          </div>
        }
      </article>
    </section>
  `
})
export class DashboardComponent implements OnInit {
  message = '';
  pets = signal<Pet[]>([]);
  reminders = signal<Reminder[]>([]);
  clinics = signal<Clinic[]>([]);
  premiumRequests = signal<PremiumRequest[]>([]);
  loading = signal(true);
  activeClinics = computed(() => this.clinics().filter((clinic) => clinic.estado === 'ACTIVE'));
  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.api.pets().subscribe({ next: (pets) => { this.pets.set(pets); this.loading.set(false); }, error: () => { this.loading.set(false); this.toast.error('No se pudo cargar el dashboard'); } });
    this.api.clinics().subscribe({ next: (clinics) => this.clinics.set(clinics), error: () => undefined });
    if (this.auth.user()?.rol !== 'VETERINARIO') {
      this.api.reminders().subscribe({ next: (reminders) => this.reminders.set(reminders), error: () => undefined });
    }
    if (this.auth.user()?.rol === 'OWNER') {
      this.auth.refreshUser().subscribe({ next: () => this.loadPremiumRequests(), error: () => this.loadPremiumRequests() });
    }
  }

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
      { tag: 'Avisos', title: 'Notificaciones', text: 'Aprobaciones, escaneos y alertas.', href: '/notificaciones', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { tag: 'Admin', title: 'Admin', text: 'Usuarios, moderación y estadísticas.', href: '/admin', roles: ['ADMIN'] }
    ];
    return cards.filter((card) => role && card.roles.includes(role));
  }

  quickActions() {
    const role = this.auth.user()?.rol;
    return [
      { title: 'Registrar o revisar mascotas', text: 'Fotos, NFC y datos críticos.', href: '/mascotas', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { title: 'Reportar mascota perdida', text: 'Publica contacto y zona de búsqueda.', href: '/perdidos', roles: ['ADMIN', 'OWNER'] },
      { title: 'Copiar link NFC', text: 'Pega el enlace en NFC Tools.', href: '/tags-nfc', roles: ['ADMIN', 'OWNER'] },
      { title: 'Historial médico', text: 'Vacunas, tratamientos y controles.', href: '/historial', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { title: 'Revisar notificaciones', text: 'Actualizaciones y alertas importantes.', href: '/notificaciones', roles: ['ADMIN', 'OWNER', 'VETERINARIO'] },
      { title: 'Aprobar clínicas', text: 'Revisa solicitudes pendientes.', href: '/admin', roles: ['ADMIN'] }
    ].filter((action) => role && action.roles.includes(role));
  }

  upcomingReminders() {
    const now = new Date();
    const limit = new Date();
    limit.setDate(limit.getDate() + 14);
    return this.reminders()
      .filter((reminder) => !reminder.completado && new Date(reminder.fecha) >= now && new Date(reminder.fecha) <= limit)
      .slice(0, 4);
  }

  resendVerification() {
    this.auth.resendVerification().subscribe((res) => { this.message = res.message; this.toast.success(res.message); });
  }

  sendReminderNotifications() {
    this.api.sendReminderNotifications().subscribe((res) => { this.message = `Recordatorios enviados: ${res.sent}`; this.toast.success(this.message); });
  }

  loadPremiumRequests() {
    this.api.myPremiumRequests().subscribe({ next: (requests) => this.premiumRequests.set(requests), error: () => undefined });
  }

  latestPremiumRequest() { return this.premiumRequests()[0]; }
  hasPendingPremium() { return this.latestPremiumRequest()?.status === 'PENDING'; }

  premiumStatus(status: string) {
    return ({ PENDING: 'En revisión', APPROVED: 'Aprobada', REJECTED: 'Rechazada' } as Record<string, string>)[status] || status;
  }
}
