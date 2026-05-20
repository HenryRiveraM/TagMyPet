import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Clinic, Pet, PetAccessRequest } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="relative overflow-hidden rounded-2xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-stone-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30 md:p-8">
      <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl dark:bg-gold/10"></div>
      <div class="pointer-events-none absolute -bottom-28 left-12 h-64 w-64 rounded-full bg-slate-900/10 blur-3xl dark:bg-white/5"></div>

      <div class="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p class="eyebrow">Red veterinaria</p>
          <h1 class="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">Clínicas veterinarias</h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-zinc-300">Gestiona clínicas oficiales, aprobación administrativa y acceso médico autorizado por mascota.</p>
        </div>
        <div class="grid grid-cols-3 gap-3 rounded-2xl border border-stone-200 bg-white/80 p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div class="rounded-xl bg-stone-50 p-3 text-center dark:bg-white/5">
            <p class="text-2xl font-bold text-slate-950 dark:text-white">{{ clinics().length }}</p>
            <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Clínicas</p>
          </div>
          <div class="rounded-xl bg-stone-50 p-3 text-center dark:bg-white/5">
            <p class="text-2xl font-bold text-slate-950 dark:text-white">{{ pendingClinics().length }}</p>
            <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Pendientes</p>
          </div>
          <div class="rounded-xl bg-stone-50 p-3 text-center dark:bg-white/5">
            <p class="text-2xl font-bold text-slate-950 dark:text-white">{{ requests().length }}</p>
            <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Accesos</p>
          </div>
        </div>
      </div>
    </section>

    @if (isLoading()) {
      <section class="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
        <div class="panel animate-pulse space-y-4 dark:border-white/10 dark:bg-zinc-950/80">
          <div class="h-5 w-40 rounded bg-stone-200 dark:bg-white/10"></div>
          <div class="h-12 rounded bg-stone-100 dark:bg-white/5"></div>
          <div class="h-12 rounded bg-stone-100 dark:bg-white/5"></div>
          <div class="h-12 rounded bg-stone-100 dark:bg-white/5"></div>
        </div>
        <div class="panel animate-pulse dark:border-white/10 dark:bg-zinc-950/80">
          <div class="h-40 rounded bg-stone-100 dark:bg-white/5"></div>
        </div>
      </section>
    }

    <div class="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
      @if (auth.user()?.rol === 'ADMIN' || (auth.user()?.rol === 'VETERINARIO' && !ownClinic())) {
        <section class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30 md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Registro oficial</p>
              <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-white">{{ auth.user()?.rol === 'ADMIN' ? 'Registrar clínica oficial' : 'Solicitar clínica oficial' }}</h2>
            </div>
            <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">{{ auth.user()?.rol === 'ADMIN' ? 'Activo inmediato' : 'Revisión admin' }}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">
            @if (auth.user()?.rol === 'VETERINARIO') {
              Completa los datos de tu clínica. Quedará pendiente hasta que el admin la apruebe.
            } @else {
              Como admin puedes crear clínicas directamente activas.
            }
          </p>
          <form class="mt-5 space-y-4" [formGroup]="clinicForm" (ngSubmit)="createClinic()">
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Nombre de clínica *</span>
              <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="nombre" placeholder="Ej. VetCare Norte">
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Teléfono *</span>
                <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="telefono" placeholder="+591...">
              </label>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">NIT</span>
                <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="nit" placeholder="Opcional">
              </label>
            </div>
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Email</span>
              <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="email" placeholder="contacto@clinica.com">
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Ciudad *</span>
                <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="ciudad" placeholder="La Paz">
              </label>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Dirección *</span>
                <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="direccion" placeholder="Av. principal 123">
              </label>
            </div>
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Sucursales</span>
              <textarea class="field min-h-28 resize-y dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="sucursalesTexto" placeholder="Una por línea: Nombre | Ciudad | Dirección | Teléfono"></textarea>
            </label>
            <button class="btn w-full shadow-lg shadow-black/10" [disabled]="clinicForm.invalid || isSubmitting()">{{ isSubmitting() ? 'Procesando...' : auth.user()?.rol === 'ADMIN' ? 'Guardar clínica' : 'Enviar solicitud' }}</button>
          </form>
        </section>
      }
      @if (auth.user()?.rol === 'VETERINARIO' && ownClinic(); as clinic) {
        <section class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30 md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Cuenta clínica</p>
              <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Tu clínica veterinaria</h2>
            </div>
            <span [class]="statusClass(clinic.estado)">{{ clinic.estado }}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">Cada cuenta veterinaria solo puede registrar una clínica. Las sucursales se manejan dentro de esta misma ficha.</p>
          <div class="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
            <p class="text-lg font-bold text-slate-950 dark:text-white">{{ clinic.nombre }}</p>
            <p class="mt-1 text-sm text-slate-600 dark:text-zinc-300">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
            <p class="mt-2 text-sm text-slate-500 dark:text-zinc-400">{{ clinic.telefono }} · {{ clinic.email || 'Sin email' }}</p>
          </div>
        </section>
      }

      @if (auth.user()?.rol === 'VETERINARIO') {
        <section class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30 md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500">Permiso médico</p>
              <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950 dark:text-white">Solicitar acceso médico</h2>
            </div>
            <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">NFC</span>
          </div>
          @if (activeClinics().length) {
            <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">Solo puedes solicitar acceso desde una clínica oficial aprobada por admin.</p>
            <form class="mt-5 grid gap-3 xl:grid-cols-[1fr_1fr_auto]" [formGroup]="accessForm" (ngSubmit)="requestAccess()">
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Código NFC de la mascota *</span>
                <input class="field dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-zinc-500" formControlName="nfcCode" placeholder="Pega el código escaneado">
              </label>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-zinc-200">Clínica oficial *</span>
                <select class="field dark:border-white/10 dark:bg-white/5 dark:text-white" formControlName="clinic">
                  @for (clinic of activeClinics(); track clinic._id) { <option [value]="clinic._id">{{ clinic.nombre }}</option> }
                </select>
              </label>
              <button class="btn self-end shadow-lg shadow-black/10" [disabled]="accessForm.invalid || isRequesting()">{{ isRequesting() ? 'Enviando...' : 'Solicitar al dueño' }}</button>
            </form>
          } @else {
            <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              Primero registra tu clínica y espera la aprobación del admin. Después podrás solicitar acceso médico a mascotas.
            </div>
          }
        </section>
      }
    </div>
    @if (message()) {
      <div class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">{{ message() }}</div>
    }
    @if (error()) {
      <div class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">{{ error() }}</div>
    }

    <section class="mt-8">
      <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Directorio</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Clínicas registradas</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-zinc-400">{{ activeClinics().length }} oficiales activas</p>
      </div>
      @if (!clinics().length && !isLoading()) {
        <div class="rounded-2xl border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-zinc-950/70 dark:text-zinc-300">Todavía no hay clínicas registradas.</div>
      }
      <div class="grid gap-4 md:grid-cols-2">
        @for (clinic of clinics(); track clinic._id) {
          <article class="group rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-stone-200/70 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/20 dark:hover:border-white/20">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold tracking-tight text-slate-950 dark:text-white">{{ clinic.nombre }}</h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-zinc-300">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
              <p class="mt-2 text-sm text-slate-500 dark:text-zinc-400">{{ clinic.telefono }} · {{ clinic.email || 'Sin email' }}</p>
            </div>
            <span [class]="statusClass(clinic.estado)">{{ clinic.estado }}</span>
          </div>
          @if (auth.user()?.rol === 'ADMIN' && clinic.estado === 'PENDING') {
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="btn-outline dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" (click)="updateClinic(clinic._id, 'ACTIVE')">Aprobar oficial</button>
              <button class="btn-outline dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" (click)="updateClinic(clinic._id, 'SUSPENDED')">Rechazar</button>
            </div>
          }
          @if (auth.user()?.rol === 'ADMIN' && clinic.estado === 'ACTIVE') {
            <button class="btn-outline mt-4 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" (click)="updateClinic(clinic._id, 'SUSPENDED')">Suspender</button>
          }
          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-stone-50 p-3 dark:bg-white/5">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Veterinarios</p>
              <p class="mt-1 text-lg font-bold text-slate-950 dark:text-white">{{ clinic.veterinarios?.length || 0 }}</p>
            </div>
            <div class="rounded-xl bg-stone-50 p-3 dark:bg-white/5">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Sucursales</p>
              <p class="mt-1 text-lg font-bold text-slate-950 dark:text-white">{{ clinic.sucursales?.length || 0 }}</p>
            </div>
          </div>
          @if (clinic.sucursales?.length) {
            <div class="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/5">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-zinc-400">Sucursales</p>
              <ul class="mt-3 space-y-2 text-sm text-slate-700 dark:text-zinc-300">
                @for (branch of branches(clinic); track branchKey(branch)) {
                  <li class="rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-950/70">{{ branch.nombre }} · {{ branch.ciudad }} · {{ branch.direccion }} @if (branch.telefono) { · {{ branch.telefono }} }</li>
                }
              </ul>
            </div>
          }
          </article>
        }
      </div>
    </section>

    <section class="mt-8 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30 md:p-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Autorizaciones</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Solicitudes de acceso</h2>
        </div>
        <p class="text-sm text-slate-500 dark:text-zinc-400">{{ pendingRequests().length }} pendientes</p>
      </div>
      @if (!requests().length && !isLoading()) {
        <div class="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">No hay solicitudes de acceso médico todavía.</div>
      } @else {
        <div class="mt-5 overflow-x-auto rounded-2xl border border-stone-200 dark:border-white/10">
          <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="bg-stone-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-white/5 dark:text-zinc-400"><tr><th class="px-4 py-3">Mascota</th><th class="px-4 py-3">Veterinario</th><th class="px-4 py-3">Clínica</th><th class="px-4 py-3">Estado</th><th class="px-4 py-3"></th></tr></thead>
          <tbody>
            @for (request of requests(); track request._id) {
              <tr class="border-t border-stone-200 transition hover:bg-stone-50 dark:border-white/10 dark:hover:bg-white/5">
                <td class="px-4 py-4 font-semibold text-slate-950 dark:text-white">{{ request.pet.nombre }}</td>
                <td class="px-4 py-4 text-slate-600 dark:text-zinc-300">{{ request.veterinarian.nombre }} {{ request.veterinarian.apellido }}</td>
                <td class="px-4 py-4 text-slate-600 dark:text-zinc-300">{{ request.clinic?.nombre || 'Sin clínica' }}</td>
                <td class="px-4 py-4"><span [class]="accessStatusClass(request.status)">{{ request.status }}</span></td>
                <td class="flex gap-2 px-4 py-3">
                  @if ((auth.user()?.rol === 'OWNER' || auth.user()?.rol === 'ADMIN') && request.status === 'PENDING') {
                    <button class="btn-outline dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" (click)="decide(request._id, 'APPROVED')">Aprobar</button>
                    <button class="btn-outline dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" (click)="decide(request._id, 'REJECTED')">Rechazar</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
        </div>
      }
    </section>
  `
})
export class ClinicsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  auth = inject(AuthService);
  clinics = signal<Clinic[]>([]);
  requests = signal<PetAccessRequest[]>([]);
  message = signal('');
  error = signal('');
  isLoading = signal(false);
  isSubmitting = signal(false);
  isRequesting = signal(false);

  clinicForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    nit: [''],
    telefono: ['', Validators.required],
    email: [''],
    ciudad: ['', Validators.required],
    direccion: ['', Validators.required],
    sucursalesTexto: ['']
  });
  accessForm = this.fb.nonNullable.group({ nfcCode: ['', Validators.required], clinic: ['', Validators.required] });

  ngOnInit() { this.load(); }
  load() {
    this.isLoading.set(true);
    this.error.set('');
    this.api.clinics().subscribe({
      next: (clinics) => {
        this.clinics.set(clinics);
        const firstActive = clinics.find((clinic) => clinic.estado === 'ACTIVE');
        if (firstActive && !this.accessForm.controls.clinic.value) this.accessForm.patchValue({ clinic: firstActive._id });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudieron cargar las clínicas');
        this.isLoading.set(false);
      }
    });
    this.api.accessRequests().subscribe({
      next: (requests) => this.requests.set(requests),
      error: (err) => this.error.set(err.error?.message || 'No se pudieron cargar las solicitudes')
    });
  }
  activeClinics() { return this.clinics().filter((clinic) => clinic.estado === 'ACTIVE'); }
  pendingClinics() { return this.clinics().filter((clinic) => clinic.estado === 'PENDING'); }
  pendingRequests() { return this.requests().filter((request) => request.status === 'PENDING'); }
  ownClinic() {
    const userId = this.auth.user()?.id || this.auth.user()?._id;
    return this.clinics().find((clinic) =>
      clinic.administradores?.some((admin) => (admin.id || admin._id) === userId) ||
      clinic.veterinarios?.some((vet) => (vet.id || vet._id) === userId)
    ) || null;
  }
  branches(clinic: Clinic) { return clinic.sucursales || []; }
  branchKey(branch: { nombre?: string; direccion?: string }) {
    return `${branch.nombre || 'Sucursal'}-${branch.direccion || ''}`;
  }
  createClinic() {
    this.isSubmitting.set(true);
    this.error.set('');
    this.message.set('');
    this.api.createClinic(this.clinicForm.getRawValue()).subscribe({
      next: () => {
        this.clinicForm.reset();
        this.message.set(this.auth.user()?.rol === 'ADMIN' ? 'Clínica creada' : 'Solicitud enviada al admin');
        this.isSubmitting.set(false);
        this.load();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo crear la clínica');
        this.isSubmitting.set(false);
      }
    });
  }
  requestAccess() {
    this.isRequesting.set(true);
    this.error.set('');
    this.message.set('');
    this.api.requestPetAccess(this.accessForm.getRawValue()).subscribe({
      next: () => {
        this.message.set('Solicitud enviada al dueño');
        this.isRequesting.set(false);
        this.load();
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo enviar la solicitud');
        this.isRequesting.set(false);
      }
    });
  }
  decide(id: string, status: 'APPROVED' | 'REJECTED' | 'REVOKED') { this.api.decidePetAccess(id, status).subscribe(() => this.load()); }
  updateClinic(id: string, estado: 'PENDING' | 'ACTIVE' | 'SUSPENDED') {
    this.api.updateClinicStatus(id, estado).subscribe(() => {
      this.message.set(estado === 'ACTIVE' ? 'Clínica aprobada como oficial' : 'Clínica suspendida');
      this.load();
    });
  }
  statusClass(status: string) {
    const base = 'inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ';
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20',
      PENDING: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20',
      SUSPENDED: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-500/20'
    };
    return base + (styles[status] || 'bg-stone-50 text-stone-700 ring-stone-200 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10');
  }
  accessStatusClass(status: string) {
    return this.statusClass(status === 'APPROVED' ? 'ACTIVE' : status === 'REJECTED' || status === 'REVOKED' ? 'SUSPENDED' : 'PENDING');
  }
}
