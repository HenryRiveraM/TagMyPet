import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Clinic, Pet, PetAccessRequest } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="relative overflow-hidden rounded-lg border border-white/70 bg-white/85 p-5 shadow-xl shadow-stone-200/70 backdrop-blur-xl sm:p-6 md:p-8">
      <div class="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p class="eyebrow">Red veterinaria</p>
          <h1 class="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">Clínicas veterinarias</h1>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-600">Gestiona clínicas oficiales, aprobación administrativa y acceso médico autorizado por mascota.</p>
        </div>
        <div class="grid grid-cols-3 gap-2 rounded-lg border border-stone-200 bg-white/80 p-2 shadow-sm sm:gap-3 sm:p-3">
          <div class="rounded-xl bg-stone-50 p-3 text-center">
            <p class="text-2xl font-bold text-slate-950">{{ clinics().length }}</p>
            <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Clínicas</p>
          </div>
          <div class="rounded-xl bg-stone-50 p-3 text-center">
            <p class="text-2xl font-bold text-slate-950">{{ pendingClinics().length }}</p>
            <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Pendientes</p>
          </div>
          <div class="rounded-xl bg-stone-50 p-3 text-center">
            <p class="text-2xl font-bold text-slate-950">{{ requests().length }}</p>
            <p class="mt-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">Accesos</p>
          </div>
        </div>
      </div>
    </section>

    @if (isLoading()) {
      <section class="mt-6 grid gap-4 lg:grid-cols-[380px_1fr]">
        <div class="panel animate-pulse space-y-4">
          <div class="h-5 w-40 rounded bg-stone-200"></div>
          <div class="h-12 rounded bg-stone-100"></div>
          <div class="h-12 rounded bg-stone-100"></div>
          <div class="h-12 rounded bg-stone-100"></div>
        </div>
        <div class="panel animate-pulse">
          <div class="h-40 rounded bg-stone-100"></div>
        </div>
      </section>
    }

    <div class="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
      @if (auth.user()?.rol === 'ADMIN' || (auth.user()?.rol === 'VETERINARIO' && !ownClinic())) {
        <section class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Registro oficial</p>
              <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">{{ auth.user()?.rol === 'ADMIN' ? 'Registrar clínica oficial' : 'Solicitar clínica oficial' }}</h2>
            </div>
            <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-700">{{ auth.user()?.rol === 'ADMIN' ? 'Activo inmediato' : 'Revisión admin' }}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-600">
            @if (auth.user()?.rol === 'VETERINARIO') {
              Completa los datos de tu clínica. Quedará pendiente hasta que el admin la apruebe.
            } @else {
              Como admin puedes crear clínicas directamente activas.
            }
          </p>
          <form class="mt-5 space-y-4" [formGroup]="clinicForm" (ngSubmit)="createClinic()">
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700">Nombre de clínica *</span>
              <input class="field" formControlName="nombre" placeholder="Ej. VetCare Norte">
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700">Teléfono *</span>
                <input class="field" formControlName="telefono" placeholder="+591...">
              </label>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700">NIT</span>
                <input class="field" formControlName="nit" placeholder="Opcional">
              </label>
            </div>
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
              <input class="field" formControlName="email" placeholder="contacto@clinica.com">
            </label>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700">Ciudad *</span>
                <input class="field" formControlName="ciudad" placeholder="La Paz">
              </label>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700">Dirección *</span>
                <input class="field" formControlName="direccion" placeholder="Av. principal 123">
              </label>
            </div>
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700">Sucursales</span>
              <textarea class="field min-h-28 resize-y" formControlName="sucursalesTexto" placeholder="Una por línea: Nombre | Ciudad | Dirección | Teléfono"></textarea>
            </label>
            <button class="btn w-full shadow-lg shadow-black/10" [disabled]="clinicForm.invalid || isSubmitting()">{{ isSubmitting() ? 'Procesando...' : auth.user()?.rol === 'ADMIN' ? 'Guardar clínica' : 'Enviar solicitud' }}</button>
          </form>
        </section>
      }
      @if (auth.user()?.rol === 'VETERINARIO' && ownClinic(); as clinic) {
        <section class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Cuenta clínica</p>
              <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">Tu clínica veterinaria</h2>
            </div>
            <span [class]="statusClass(clinic.estado)">{{ clinic.estado }}</span>
          </div>
          <p class="mt-3 text-sm leading-6 text-slate-600">Cada cuenta veterinaria solo puede registrar una clínica. Las sucursales se manejan dentro de esta misma ficha.</p>
          <div class="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p class="text-lg font-bold text-slate-950">{{ clinic.nombre }}</p>
            <p class="mt-1 text-sm text-slate-600">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
            <p class="mt-2 text-sm text-slate-500">{{ clinic.telefono }} · {{ clinic.email || 'Sin email' }}</p>
          </div>
        </section>
      }

      @if (auth.user()?.rol === 'VETERINARIO') {
        <section class="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-400">Permiso médico</p>
              <h2 class="mt-2 text-xl font-bold tracking-tight text-slate-950">Solicitar acceso médico</h2>
            </div>
            <span class="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-slate-700">NFC</span>
          </div>
          @if (activeClinics().length) {
            <p class="mt-3 text-sm leading-6 text-slate-600">Solo puedes solicitar acceso desde una clínica oficial aprobada por admin.</p>
            <form class="mt-5 grid gap-3 xl:grid-cols-[1fr_1fr_auto]" [formGroup]="accessForm" (ngSubmit)="requestAccess()">
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700">Código NFC de la mascota *</span>
                <input class="field" formControlName="nfcCode" placeholder="Pega el código escaneado">
              </label>
              <label class="block">
                <span class="mb-1.5 block text-sm font-semibold text-slate-700">Clínica oficial *</span>
                <select class="field" formControlName="clinic">
                  @for (clinic of activeClinics(); track clinic._id) { <option [value]="clinic._id">{{ clinic.nombre }}</option> }
                </select>
              </label>
              <button class="btn self-end shadow-lg shadow-black/10" [disabled]="accessForm.invalid || isRequesting()">{{ isRequesting() ? 'Enviando...' : 'Solicitar al dueño' }}</button>
            </form>
          } @else {
            <div class="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              Primero registra tu clínica y espera la aprobación del admin. Después podrás solicitar acceso médico a mascotas.
            </div>
          }
        </section>
      }
    </div>
    @if (message()) {
      <div class="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm">{{ message() }}</div>
    }
    @if (error()) {
      <div class="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm">{{ error() }}</div>
    }

    <section class="mt-8 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-stone-200/60 backdrop-blur-xl md:p-5">
      <div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Directorio</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950">Clínicas registradas</h2>
          <p class="mt-1 text-sm text-slate-600">Clínicas oficiales visibles para dueños y veterinarios autorizados.</p>
        </div>
        <span class="inline-flex w-fit items-center rounded-full border border-stone-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm">{{ activeClinics().length }} oficiales activas</span>
      </div>
      @if (!clinics().length && !isLoading()) {
        <div class="rounded-2xl border border-dashed border-stone-300 bg-white/70 p-8 text-center text-sm text-slate-600">Todavía no hay clínicas registradas.</div>
      }
      <div class="grid gap-4 md:grid-cols-2">
        @for (clinic of clinics(); track clinic._id) {
          <article class="group rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm shadow-stone-200/70 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="text-xl font-bold tracking-tight text-slate-950">{{ clinic.nombre }}</h3>
              <p class="mt-1 text-sm text-slate-600">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
              <p class="mt-2 text-sm text-slate-500">{{ clinic.telefono }} · {{ clinic.email || 'Sin email' }}</p>
            </div>
            <span [class]="statusClass(clinic.estado)">{{ clinic.estado }}</span>
          </div>
          @if (auth.user()?.rol === 'ADMIN' && clinic.estado === 'PENDING') {
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="btn-outline" (click)="updateClinic(clinic._id, 'ACTIVE')">Aprobar oficial</button>
              <button class="btn-outline" (click)="updateClinic(clinic._id, 'SUSPENDED')">Rechazar</button>
            </div>
          }
          @if (auth.user()?.rol === 'ADMIN' && clinic.estado === 'ACTIVE') {
            <button class="btn-outline mt-4" (click)="updateClinic(clinic._id, 'SUSPENDED')">Suspender</button>
          }
          <div class="mt-5 grid grid-cols-2 gap-3">
            <div class="rounded-xl bg-stone-50 p-3">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Veterinarios</p>
              <p class="mt-1 text-lg font-bold text-slate-950">{{ clinic.veterinarios?.length || 0 }}</p>
            </div>
            <div class="rounded-xl bg-stone-50 p-3">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Sucursales</p>
              <p class="mt-1 text-lg font-bold text-slate-950">{{ clinic.sucursales?.length || 0 }}</p>
            </div>
          </div>
          @if (clinic.sucursales?.length) {
            <div class="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Sucursales</p>
              <ul class="mt-3 space-y-2 text-sm text-slate-700">
                @for (branch of branches(clinic); track branchKey(branch)) {
                  <li class="rounded-xl bg-white p-3 shadow-sm">{{ branch.nombre }} · {{ branch.ciudad }} · {{ branch.direccion }} @if (branch.telefono) { · {{ branch.telefono }} }</li>
                }
              </ul>
            </div>
          }
          </article>
        }
      </div>
    </section>

    <section class="mt-8 rounded-2xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-stone-200/60 backdrop-blur-xl md:p-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="eyebrow">Autorizaciones</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-slate-950">Solicitudes de acceso</h2>
        </div>
        <p class="text-sm text-slate-500">{{ pendingRequests().length }} pendientes</p>
      </div>
      @if (!requests().length && !isLoading()) {
        <div class="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-sm text-slate-600">No hay solicitudes de acceso médico todavía.</div>
      } @else {
        <div class="mt-5 grid gap-3 md:hidden">
          @for (request of requests(); track request._id) {
            <article class="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="font-bold">{{ request.pet.nombre }}</p>
                  <p class="mt-1 text-sm text-slate-600">{{ request.veterinarian.nombre }} {{ request.veterinarian.apellido }}</p>
                  <p class="mt-1 text-xs text-slate-500">{{ request.clinic?.nombre || 'Sin clínica' }}</p>
                </div>
                <span [class]="accessStatusClass(request.status)">{{ request.status }}</span>
              </div>
              @if ((auth.user()?.rol === 'OWNER' || auth.user()?.rol === 'ADMIN') && request.status === 'PENDING') {
                <div class="mt-4 grid grid-cols-2 gap-2">
                  <button class="btn-outline" (click)="decide(request._id, 'APPROVED')">Aprobar</button>
                  <button class="btn-outline" (click)="decide(request._id, 'REJECTED')">Rechazar</button>
                </div>
              }
            </article>
          }
        </div>
        <div class="mt-5 hidden overflow-x-auto rounded-lg border border-stone-200 md:block">
          <table class="w-full min-w-[720px] text-left text-sm">
          <thead class="bg-stone-50 text-xs uppercase tracking-wide text-slate-500"><tr><th class="px-4 py-3">Mascota</th><th class="px-4 py-3">Veterinario</th><th class="px-4 py-3">Clínica</th><th class="px-4 py-3">Estado</th><th class="px-4 py-3"></th></tr></thead>
          <tbody>
            @for (request of requests(); track request._id) {
              <tr class="border-t border-stone-200 transition hover:bg-stone-50">
                <td class="px-4 py-4 font-semibold text-slate-950">{{ request.pet.nombre }}</td>
                <td class="px-4 py-4 text-slate-600">{{ request.veterinarian.nombre }} {{ request.veterinarian.apellido }}</td>
                <td class="px-4 py-4 text-slate-600">{{ request.clinic?.nombre || 'Sin clínica' }}</td>
                <td class="px-4 py-4"><span [class]="accessStatusClass(request.status)">{{ request.status }}</span></td>
                <td class="flex gap-2 px-4 py-3">
                  @if ((auth.user()?.rol === 'OWNER' || auth.user()?.rol === 'ADMIN') && request.status === 'PENDING') {
                    <button class="btn-outline" (click)="decide(request._id, 'APPROVED')">Aprobar</button>
                    <button class="btn-outline" (click)="decide(request._id, 'REJECTED')">Rechazar</button>
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
  private toast = inject(ToastService);
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
        const message = err.error?.message || 'No se pudieron cargar las clínicas';
        this.error.set(message);
        this.toast.error(message);
        this.isLoading.set(false);
      }
    });
    this.api.accessRequests().subscribe({
      next: (requests) => this.requests.set(requests),
      error: (err) => {
        const message = err.error?.message || 'No se pudieron cargar las solicitudes';
        this.error.set(message);
        this.toast.error(message);
      }
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
        const message = this.auth.user()?.rol === 'ADMIN' ? 'Clínica creada' : 'Solicitud enviada al admin';
        this.message.set(message);
        this.toast.success(message);
        this.isSubmitting.set(false);
        this.load();
      },
      error: (err) => {
        const message = err.error?.message || 'No se pudo crear la clínica';
        this.error.set(message);
        this.toast.error(message);
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
        this.toast.success('Solicitud enviada al dueño');
        this.isRequesting.set(false);
        this.load();
      },
      error: (err) => {
        const message = err.error?.message || 'No se pudo enviar la solicitud';
        this.error.set(message);
        this.toast.error(message);
        this.isRequesting.set(false);
      }
    });
  }
  decide(id: string, status: 'APPROVED' | 'REJECTED' | 'REVOKED') {
    this.api.decidePetAccess(id, status).subscribe({
      next: () => { this.toast.success(status === 'APPROVED' ? 'Acceso médico aprobado' : 'Acceso médico rechazado'); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar la solicitud')
    });
  }
  updateClinic(id: string, estado: 'PENDING' | 'ACTIVE' | 'SUSPENDED') {
    this.api.updateClinicStatus(id, estado).subscribe({
      next: () => {
        const message = estado === 'ACTIVE' ? 'Clínica aprobada como oficial' : 'Clínica suspendida';
        this.message.set(message);
        this.toast.success(message);
        this.load();
      },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar la clínica')
    });
  }
  statusClass(status: string) {
    const base = 'inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ';
    const styles: Record<string, string> = {
      ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
      SUSPENDED: 'bg-red-50 text-red-700 ring-red-200'
    };
    return base + (styles[status] || 'bg-stone-50 text-stone-700 ring-stone-200');
  }
  accessStatusClass(status: string) {
    return this.statusClass(status === 'APPROVED' ? 'ACTIVE' : status === 'REJECTED' || status === 'REVOKED' ? 'SUSPENDED' : 'PENDING');
  }
}
