import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Adoption, AdoptionApplication, Pet } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mb-6 rounded-lg border border-white/80 bg-white/80 p-6 shadow-xl shadow-slate-200/70">
      <p class="eyebrow">Hogar responsable</p>
      <h1 class="mt-2 text-3xl font-bold">Adopciones responsables</h1>
      <p class="mt-2 text-slate-600">Publicaciones abiertas con filtros, cuestionario obligatorio y firma digital.</p>
      <form class="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]" [formGroup]="filter" (ngSubmit)="load()">
        <select class="field" formControlName="especie">
          <option value="">Especie</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>
        <input class="field" formControlName="raza" placeholder="Raza">
        <select class="field" formControlName="edad">
          <option value="">Edad máxima</option>
          <option value="1">Hasta 1 año</option>
          <option value="3">Hasta 3 años</option>
          <option value="7">Hasta 7 años</option>
          <option value="20">Todas las edades</option>
        </select>
        <button class="btn">Filtrar</button>
      </form>
    </section>
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      @if (canManageAdoptions()) {
        <section class="panel h-fit">
          <h2 class="font-semibold">Publicar adopción</h2>
          <p class="mt-2 text-sm text-slate-600">Selecciona una mascota propia y describe el hogar ideal.</p>
          @if (pets().length) {
            <form class="mt-4 space-y-3" [formGroup]="publishForm" (ngSubmit)="publish()">
              <select class="field" formControlName="pet">@for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }} *</option> }</select>
              <input class="field" formControlName="ciudad" placeholder="Ciudad *">
              <textarea class="field min-h-28" formControlName="descripcion" placeholder="Descripción *"></textarea>
              <button class="btn w-full" [disabled]="publishForm.invalid">Publicar</button>
            </form>
          } @else {
            <div class="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">
              Registra una mascota antes de publicarla en adopción.
              <a routerLink="/mascotas" class="mt-3 inline-flex font-bold text-brand">Registrar mascota</a>
            </div>
          }
        </section>
      } @else {
        <section class="panel h-fit">
          <h2 class="font-semibold">¿Quieres postular?</h2>
          <p class="mt-2 text-sm text-slate-600">Inicia sesión como dueño para llenar el cuestionario y firmar digitalmente una solicitud.</p>
          <a routerLink="/login" class="btn mt-4 w-full">Iniciar sesión</a>
        </section>
      }
      <section class="grid gap-4">
        @if (loading()) {
          @for (item of [1,2,3]; track item) {
            <article class="panel min-h-56 animate-pulse"><div class="h-40 rounded-md bg-stone-100"></div><div class="mt-5 h-5 w-1/2 rounded bg-stone-100"></div><div class="mt-3 h-4 w-2/3 rounded bg-stone-100"></div></article>
          }
        }
        @if (!adoptions().length && !loading()) {
          <article class="panel text-center">
            <p class="eyebrow">Sin publicaciones</p>
            <h2 class="mt-2 text-xl font-bold">No hay mascotas en adopción con estos filtros</h2>
            <p class="mt-2 text-sm text-slate-600">Prueba cambiar especie, raza o edad máxima.</p>
          </article>
        }
        @for (adoption of adoptions(); track adoption._id) {
          <article class="panel grid gap-4 overflow-hidden md:grid-cols-[240px_1fr]">
            <div class="aspect-[4/3] w-full overflow-hidden rounded-lg bg-stone-100 md:h-full">
              <img class="h-full w-full object-cover" [style.object-position]="position(adoption.pet)" [src]="adoption.pet.foto || 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=900&q=80'" [alt]="adoption.pet.nombre">
            </div>
            <div>
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span class="badge">Adopción abierta</span>
                  <h2 class="mt-3 text-2xl font-bold">{{ adoption.pet.nombre }}</h2>
                  <p class="text-sm text-slate-600">{{ adoption.ciudad }} · {{ adoption.pet.especie }} · {{ adoption.pet.raza || 'Sin raza' }} · {{ adoption.pet.edad || 0 }} años</p>
                </div>
                <span class="rounded-md bg-stone-100 px-3 py-1 text-xs font-bold text-slate-600">{{ adoption.pet.sexo || 'Sin sexo' }}</span>
              </div>
              <p class="mt-2 text-sm">{{ adoption.descripcion }}</p>
              @if (isMyListing(adoption)) {
                <div class="mt-4 flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <p class="text-sm font-semibold text-slate-700">Esta publicación es tuya.</p>
                  <button type="button" class="btn-outline" (click)="close(adoption)">Cerrar publicación</button>
                </div>
              } @else if (canManageAdoptions()) {
                <details class="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-4">
                  <summary class="cursor-pointer font-bold">Solicitar adopción responsable</summary>
                  <form class="mt-4 grid gap-2 md:grid-cols-2" [formGroup]="applyForm" (ngSubmit)="apply(adoption._id)">
                    <input class="field" formControlName="espacio" placeholder="Espacio disponible *">
                    <input class="field" formControlName="experiencia" placeholder="Experiencia *">
                    <input class="field" formControlName="recursos" placeholder="Recursos *">
	                    <input class="field" formControlName="compromiso" placeholder="Compromiso *">
	                    <input class="field md:col-span-2" formControlName="firmaDigital" placeholder="Firma digital *">
	                    <label class="flex items-start gap-3 rounded-md border border-stone-200 bg-white p-3 text-sm text-slate-700 md:col-span-2">
	                      <input class="mt-1" type="checkbox" formControlName="consentimientoPerfilPublico">
	                      <span>Si soy aprobado, autorizo que mi teléfono sea el contacto público del perfil NFC de esta mascota. *</span>
	                    </label>
	                    <button class="btn md:col-span-2" [disabled]="applyForm.invalid">Enviar solicitud firmada</button>
                  </form>
                </details>
              }
            </div>
          </article>
        }
      </section>
    </div>

    @if (canManageAdoptions()) {
      <section class="mt-8 panel">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="eyebrow">Seguimiento</p>
            <h2 class="mt-2 text-2xl font-bold">Solicitudes de adopción</h2>
            <p class="mt-2 text-sm text-slate-600">Aprueba candidatos de tus mascotas o consulta el estado de tus postulaciones.</p>
          </div>
          <span class="badge">{{ applications().length }} solicitudes</span>
        </div>
        @if (!applications().length) {
          <div class="mt-5 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-sm text-slate-600">Todavía no tienes solicitudes enviadas ni recibidas.</div>
        } @else {
          <div class="mt-5 grid gap-4 lg:grid-cols-2">
            @for (application of applications(); track application._id) {
              <article class="rounded-lg border border-stone-200 bg-stone-50 p-5">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-bold uppercase tracking-wide text-slate-500">{{ isReceived(application) ? 'Solicitud recibida' : 'Mi postulación' }}</p>
                    <h3 class="mt-2 text-lg font-bold">{{ application.adoption.pet.nombre }}</h3>
                    <p class="mt-1 text-sm text-slate-600">
                      @if (isReceived(application)) { {{ application.solicitante.nombre }} {{ application.solicitante.apellido }} } @else { Enviada al dueño }
                    </p>
                  </div>
                  <span class="rounded-md px-3 py-1 text-xs font-bold" [class.bg-amber-100]="application.estado === 'PENDING'" [class.text-amber-800]="application.estado === 'PENDING'" [class.bg-emerald-100]="application.estado === 'APPROVED'" [class.text-emerald-800]="application.estado === 'APPROVED'" [class.bg-red-100]="application.estado === 'REJECTED'" [class.text-red-800]="application.estado === 'REJECTED'">{{ applicationStatus(application.estado) }}</span>
                </div>
                @if (isReceived(application)) {
                  <div class="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                    <p><strong>Espacio:</strong> {{ application.cuestionario.espacio }}</p>
                    <p><strong>Experiencia:</strong> {{ application.cuestionario.experiencia }}</p>
                    <p><strong>Recursos:</strong> {{ application.cuestionario.recursos }}</p>
                    <p><strong>Compromiso:</strong> {{ application.cuestionario.compromiso }}</p>
                    <p><strong>Contacto:</strong> {{ application.solicitante.telefono || application.solicitante.email }}</p>
                    <p><strong>Firma:</strong> {{ application.firmaDigital }}</p>
                  </div>
                  @if (application.estado === 'PENDING') {
                    <div class="mt-4 flex gap-2">
                      <button type="button" class="btn" (click)="decide(application, 'APPROVED')">Aprobar</button>
                      <button type="button" class="btn-outline" (click)="decide(application, 'REJECTED')">Rechazar</button>
                    </div>
                  }
                }
              </article>
            }
          </div>
        }
      </section>
    }
  `
})
export class AdoptionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  adoptions = signal<Adoption[]>([]);
  applications = signal<AdoptionApplication[]>([]);
  pets = signal<Pet[]>([]);
  loading = signal(true);
  filter = this.fb.nonNullable.group({ especie: [''], raza: [''], edad: [''] });
  publishForm = this.fb.nonNullable.group({ pet: ['', Validators.required], ciudad: ['', Validators.required], descripcion: ['', Validators.required] });
  applyForm = this.fb.nonNullable.group({
    espacio: ['', Validators.required],
    experiencia: ['', Validators.required],
	    recursos: ['', Validators.required],
	    compromiso: ['', Validators.required],
	    firmaDigital: ['', Validators.required],
	    consentimientoPerfilPublico: [false, Validators.requiredTrue]
  });

  ngOnInit() {
    this.load();
    if (this.canManageAdoptions()) this.loadApplications();
    this.api.pets().subscribe({ next: (pets) => { this.pets.set(pets); if (pets[0]) this.publishForm.patchValue({ pet: pets[0]._id }); }, error: () => undefined });
  }
  load() {
    this.loading.set(true);
    this.api.adoptions(this.filter.getRawValue()).subscribe({
      next: (adoptions) => { this.adoptions.set(adoptions); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('No se pudieron cargar las adopciones'); }
    });
  }
  canManageAdoptions() { return ['ADMIN', 'OWNER'].includes(this.auth.user()?.rol || ''); }
  publish() { this.api.createAdoption({ ...this.publishForm.getRawValue(), requisitos: ['Seguimiento veterinario'] }).subscribe({ next: () => { this.toast.success('Publicación de adopción creada'); this.load(); this.loadApplications(); }, error: (err) => this.toast.error(err.error?.message || 'No se pudo publicar') }); }
  apply(id: string) {
	    const { firmaDigital, consentimientoPerfilPublico, ...cuestionario } = this.applyForm.getRawValue();
	    this.api.applyAdoption(id, { firmaDigital, consentimientoPerfilPublico, cuestionario }).subscribe({ next: () => { this.toast.success('Solicitud de adopción enviada'); this.applyForm.reset({ consentimientoPerfilPublico: false }); this.loadApplications(); }, error: (err) => this.toast.error(err.error?.message || 'No se pudo enviar la solicitud') });
  }
  loadApplications() {
    this.api.adoptionApplications().subscribe({ next: (applications) => this.applications.set(applications), error: () => this.toast.error('No se pudieron cargar tus solicitudes') });
  }
  isMyListing(adoption: Adoption) {
    const userId = this.auth.user()?.id || this.auth.user()?._id;
    return this.auth.user()?.rol === 'ADMIN' || Boolean(userId && adoption.owner?._id === userId);
  }
  isReceived(application: AdoptionApplication) {
    const userId = this.auth.user()?.id || this.auth.user()?._id;
    return this.auth.user()?.rol === 'ADMIN' || Boolean(userId && application.adoption.owner?._id === userId);
  }
  close(adoption: Adoption) {
    if (!confirm(`¿Cerrar la publicación de ${adoption.pet.nombre}?`)) return;
    this.api.closeAdoption(adoption._id).subscribe({ next: () => { this.toast.success('Publicación cerrada'); this.load(); this.loadApplications(); }, error: (err) => this.toast.error(err.error?.message || 'No se pudo cerrar la publicación') });
  }
  decide(application: AdoptionApplication, estado: 'APPROVED' | 'REJECTED') {
    const message = estado === 'APPROVED'
	      ? 'Al aprobar, la mascota y el contacto NFC pasarán al nuevo dueño. ¿Continuar?'
      : '¿Rechazar esta solicitud?';
    if (!confirm(message)) return;
    this.api.decideAdoptionApplication(application._id, estado).subscribe({ next: () => { this.toast.success(estado === 'APPROVED' ? 'Adopción aprobada' : 'Solicitud rechazada'); this.load(); this.loadApplications(); }, error: (err) => this.toast.error(err.error?.message || 'No se pudo responder la solicitud') });
  }
  applicationStatus(status: string) {
    return ({ PENDING: 'Pendiente', APPROVED: 'Aprobada', REJECTED: 'Rechazada' } as Record<string, string>)[status] || status;
  }
  position(pet: Pet) {
    return `${pet.fotoPosicionX ?? 50}% ${pet.fotoPosicionY ?? 50}%`;
  }
}
