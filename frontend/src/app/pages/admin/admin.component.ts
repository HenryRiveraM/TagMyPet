import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { Clinic, PremiumRequest, User } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  template: `
    <section class="mb-6 overflow-hidden rounded-lg border border-white/80 bg-slate-950 p-6 text-white shadow-xl shadow-slate-300/50 md:p-8">
      <p class="eyebrow text-stone-200">Operación</p>
      <h1 class="mt-2 text-3xl font-bold">Panel admin</h1>
      <p class="mt-2 max-w-2xl text-stone-300">Gestión, moderación, aprobación de clínicas y métricas principales.</p>
    </section>
    <section class="mb-6 grid gap-4 md:grid-cols-5">
      @for (item of statItems(); track item.label) {
        <article class="panel">
          <p class="text-sm text-slate-500">{{ item.label }}</p>
          <p class="mt-2 text-3xl font-bold text-brand">{{ item.value }}</p>
        </article>
      }
    </section>
    <section class="mb-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
      <article class="panel">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="eyebrow">Clínicas pendientes</p>
            <h2 class="mt-2 text-xl font-bold">Aprobación oficial</h2>
          </div>
          <span class="badge">{{ pendingClinics().length }} pendientes</span>
        </div>
        @if (loading()) {
          <div class="mt-5 rounded-lg bg-stone-50 p-6 text-sm text-slate-600">Cargando clínicas pendientes...</div>
        } @else if (pendingClinics().length) {
          <div class="mt-5 space-y-3">
            @for (clinic of pendingClinics(); track clinic._id) {
              <div class="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p class="font-bold">{{ clinic.nombre }}</p>
                    <p class="mt-1 text-sm text-slate-600">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
                    <p class="mt-1 text-xs text-slate-500">{{ clinic.telefono }} · {{ clinic.email || 'Sin email' }}</p>
                  </div>
                  <div class="flex gap-2">
                    <button class="btn" (click)="updateClinic(clinic, 'ACTIVE')">Aprobar</button>
                    <button class="btn-outline" (click)="updateClinic(clinic, 'SUSPENDED')">Rechazar</button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="mt-5 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-slate-600">No hay clínicas pendientes por aprobar.</div>
        }
      </article>
      <article class="panel">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="eyebrow">Usuarios</p>
            <h2 class="mt-2 text-xl font-bold">Cuentas y estados</h2>
          </div>
          <span class="badge">{{ users().length }} usuarios</span>
        </div>
        @if (loading()) {
          <div class="mt-5 rounded-lg bg-stone-50 p-6 text-sm text-slate-600">Cargando usuarios...</div>
        } @else {
        <div class="mt-5 max-h-[420px] overflow-auto rounded-lg border border-stone-200">
          <table class="w-full min-w-[720px] text-left text-sm">
            <thead class="bg-stone-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              @for (user of users(); track user._id || user.id) {
                <tr class="border-t border-stone-200">
                  <td class="px-4 py-3 font-semibold">{{ user.nombre }} {{ user.apellido }}</td>
                  <td>{{ user.email }}</td>
                  <td><span class="badge">{{ user.rol }}</span></td>
                  <td>{{ user.estado || 'ACTIVE' }}</td>
                  <td><button class="btn-outline" (click)="toggle(user)">{{ user.estado === 'SUSPENDED' ? 'Activar' : 'Suspender' }}</button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        }
      </article>
    </section>
    <section class="panel mb-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="eyebrow">Planes Premium</p>
          <h2 class="mt-2 text-xl font-bold">Pagos por verificar</h2>
          <p class="mt-2 text-sm text-slate-600">Premium se activa solo después de revisar la referencia de pago de 70 Bs/mes.</p>
        </div>
        <span class="badge">{{ pendingPremium().length }} pendientes</span>
      </div>
      @if (!premiumRequests().length) {
        <div class="mt-5 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-slate-600">No hay solicitudes Premium todavía.</div>
      } @else {
        <div class="mt-5 grid gap-3 lg:grid-cols-2">
          @for (request of premiumRequests(); track request._id) {
            <article class="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-bold">{{ request.user?.nombre }} {{ request.user?.apellido }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ request.user?.email }}</p>
                  <p class="mt-3 text-sm text-slate-700"><strong>Referencia:</strong> {{ request.paymentReference }}</p>
                  @if (request.notes) { <p class="mt-1 text-sm text-slate-600">{{ request.notes }}</p> }
                </div>
                <span class="badge">{{ request.status }}</span>
              </div>
              @if (request.status === 'PENDING') {
                <div class="mt-4 flex gap-2">
                  <button class="btn" (click)="decidePremium(request, 'APPROVED')">Activar Premium</button>
                  <button class="btn-outline" (click)="decidePremium(request, 'REJECTED')">Rechazar</button>
                </div>
              }
            </article>
          }
        </div>
      }
    </section>
    <section class="panel">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="eyebrow">Clínicas registradas</p>
          <h2 class="mt-2 text-xl font-bold">Directorio administrativo</h2>
        </div>
        <span class="badge">{{ clinics().length }} clínicas</span>
      </div>
      <div class="mt-5 grid gap-3 md:grid-cols-2">
        @for (clinic of clinics(); track clinic._id) {
          <article class="rounded-lg border border-stone-200 bg-stone-50 p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-bold">{{ clinic.nombre }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
              </div>
              <span class="badge">{{ clinic.estado }}</span>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button class="btn-outline" (click)="updateClinic(clinic, 'ACTIVE')">Activar</button>
              <button class="btn-outline" (click)="updateClinic(clinic, 'SUSPENDED')">Suspender</button>
            </div>
          </article>
        }
      </div>
    </section>
  `
})
export class AdminComponent implements OnInit {
  stats = signal<Record<string, number>>({});
  users = signal<User[]>([]);
  clinics = signal<Clinic[]>([]);
  premiumRequests = signal<PremiumRequest[]>([]);
  loading = signal(true);
  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit() { this.load(); }
  pendingClinics() { return this.clinics().filter((clinic) => clinic.estado === 'PENDING'); }
  pendingPremium() { return this.premiumRequests().filter((request) => request.status === 'PENDING'); }
  statItems() {
    const s = this.stats();
    return [
      { label: 'Usuarios', value: s['users'] || 0 },
      { label: 'Mascotas', value: s['pets'] || 0 },
      { label: 'Perdidos', value: s['lost'] || 0 },
      { label: 'Adopciones', value: s['adoptions'] || 0 },
      { label: 'Premium', value: s['premium'] || 0 },
      { label: 'Premium pendientes', value: s['pendingPremium'] || 0 },
      { label: 'Clínicas', value: s['clinics'] || 0 },
      { label: 'Tags NFC', value: s['tags'] || 0 }
    ];
  }
  load() {
    this.loading.set(true);
    this.api.adminStats().subscribe((s) => this.stats.set(s));
    this.api.users().subscribe((u) => this.users.set(u));
    this.api.premiumRequests().subscribe({ next: (requests) => this.premiumRequests.set(requests), error: () => this.toast.error('No se pudieron cargar las solicitudes Premium') });
    this.api.clinics().subscribe({ next: (clinics) => { this.clinics.set(clinics); this.loading.set(false); }, error: () => { this.loading.set(false); this.toast.error('No se pudo cargar el panel admin'); } });
  }
  toggle(user: User) {
    const id = user._id || user.id;
    if (!id) return;
    const estado = user.estado === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.api.updateUserStatus(id, estado).subscribe({ next: () => { this.toast.success(estado === 'ACTIVE' ? 'Usuario activado' : 'Usuario suspendido'); this.load(); }, error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar el usuario') });
  }
  updateClinic(clinic: Clinic, estado: 'ACTIVE' | 'SUSPENDED') {
    this.api.updateClinicStatus(clinic._id, estado).subscribe({ next: () => { this.toast.success(estado === 'ACTIVE' ? 'Clínica aprobada' : 'Clínica suspendida'); this.load(); }, error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar la clínica') });
  }
  decidePremium(request: PremiumRequest, status: 'APPROVED' | 'REJECTED') {
    if (!confirm(status === 'APPROVED' ? '¿Confirmas que verificaste el pago y deseas activar Premium?' : '¿Rechazar esta solicitud Premium?')) return;
    this.api.decidePremiumRequest(request._id, status).subscribe({
      next: () => { this.toast.success(status === 'APPROVED' ? 'Premium activado' : 'Solicitud rechazada'); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo procesar la solicitud')
    });
  }
}
