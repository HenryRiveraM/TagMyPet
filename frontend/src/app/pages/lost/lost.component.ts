import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { LostReport, Pet } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';
import { PhotoGalleryView, PhotoViewerComponent } from '../../components/photo-viewer/photo-viewer.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, PhotoViewerComponent],
  template: `
    <section class="mb-6 flex flex-col justify-between gap-4 md:flex-row">
      <div>
        <h1 class="text-3xl font-bold">Mascotas perdidas</h1>
        <p class="text-slate-600">Listado público con contacto seguro y filtros.</p>
      </div>
      <form class="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_auto]" [formGroup]="filter" (ngSubmit)="load()">
        <input class="field" formControlName="texto" placeholder="Buscar por nombre, zona o descripción">
        <select class="field" formControlName="ciudad">
          <option value="">Departamento / ciudad</option>
          @for (city of cities; track city) { <option [value]="city">{{ city }}</option> }
        </select>
        <select class="field" formControlName="especie">
          <option value="">Especie</option>
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>
        <input class="field" formControlName="raza" placeholder="Raza">
        <button class="btn">Buscar</button>
      </form>
    </section>
    <div class="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section class="panel">
        <h2 class="font-semibold">Reportar pérdida</h2>
        @if (canCreateLost()) {
          @if (pets().length) {
            <form class="mt-4 space-y-3" [formGroup]="form" (ngSubmit)="create()">
              <select class="field" formControlName="pet">@for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }} *</option> }</select>
              <input class="field" formControlName="ciudad" placeholder="Ciudad *">
              <input class="field" formControlName="zona" placeholder="Zona">
              <input class="field" formControlName="contactoPublico" placeholder="Teléfono público *">
              <textarea class="field" formControlName="descripcion" placeholder="Descripción"></textarea>
              <button class="btn w-full" [disabled]="form.invalid">Publicar</button>
            </form>
          } @else {
            <div class="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">Registra una mascota antes de reportarla como perdida.</div>
          }
        } @else {
          <div class="mt-4 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">Inicia sesión como dueño para reportar una mascota perdida.</div>
        }
      </section>
      <section class="grid gap-4 md:grid-cols-2">
        @if (loading()) {
          @for (item of [1,2,3,4]; track item) {
            <article class="panel min-h-80 animate-pulse"><div class="h-48 rounded-md bg-stone-100"></div><div class="mt-5 h-5 w-1/2 rounded bg-stone-100"></div><div class="mt-3 h-4 w-2/3 rounded bg-stone-100"></div></article>
          }
        }
        @if (!reports().length && !loading()) {
          <article class="panel text-center md:col-span-2">
            <p class="eyebrow">Sin reportes</p>
            <h2 class="mt-2 text-xl font-bold">No hay mascotas perdidas con estos filtros</h2>
            <p class="mt-2 text-sm text-slate-600">Cambia departamento, especie, raza o búsqueda.</p>
          </article>
        }
        @for (report of reports(); track report._id) {
          <article class="panel">
            <button type="button" class="group relative mb-4 block w-full overflow-hidden rounded-md bg-stone-100 text-left" (click)="openGallery(report.pet, 0)" [attr.aria-label]="'Ampliar fotos de ' + report.pet.nombre">
              <span class="flex aspect-[4/3] w-full items-center justify-center">
                <img class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" [style.object-position]="coverPosition(report.pet)" [src]="mainPhoto(report.pet)" [alt]="report.pet.nombre">
              </span>
              <span class="absolute bottom-3 right-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-focus:opacity-100">Ampliar</span>
            </button>
            @if ((photos(report.pet).length || 0) > 1) {
              <div class="mb-4 grid grid-cols-5 gap-2">
                @for (photo of photos(report.pet); track photo; let i = $index) {
                  <button type="button" class="overflow-hidden rounded-md bg-stone-100 ring-brand/20 transition hover:ring-4" (click)="openGallery(report.pet, i)">
                    <img class="aspect-square w-full object-cover" [src]="photo" [alt]="report.pet.nombre + ' foto ' + (i + 1)">
                  </button>
                }
              </div>
            } @else {
              <button type="button" class="mb-4 text-sm font-semibold text-brand" (click)="openGallery(report.pet, 0)">Ver foto completa</button>
            }
            <h2 class="text-xl font-semibold">{{ report.pet.nombre }}</h2>
            <p class="text-sm text-slate-600">{{ report.ciudad }} · {{ report.zona || 'Zona no especificada' }}</p>
            <p class="mt-2 text-sm">{{ report.descripcion }}</p>
            <p class="mt-3 font-semibold text-brand">{{ report.contactoPublico }}</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button class="btn-outline" (click)="share(report)">Compartir</button>
              @if (canMarkFound(report)) {
                <button class="btn" (click)="markFound(report)">Marcar encontrada</button>
              }
            </div>
          </article>
        }
      </section>
    </div>

    @if (gallery(); as view) {
      <app-photo-viewer [view]="view" (dismissed)="closeGallery()" />
    }
  `
})
export class LostComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  reports = signal<LostReport[]>([]);
  pets = signal<Pet[]>([]);
  loading = signal(true);
  ownedPetIds = signal<Set<string>>(new Set());
  gallery = signal<PhotoGalleryView | null>(null);
  cities = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'];
  filter = this.fb.nonNullable.group({ texto: [''], ciudad: [''], especie: [''], raza: [''] });
  form = this.fb.nonNullable.group({
    pet: ['', Validators.required],
    ciudad: ['', Validators.required],
    zona: [''],
    contactoPublico: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit() { this.load(); this.api.pets().subscribe({ next: (pets) => { this.pets.set(pets); this.ownedPetIds.set(new Set(pets.map((pet) => pet._id))); if (pets[0]) this.form.patchValue({ pet: pets[0]._id }); }, error: () => undefined }); }
  load() {
    this.loading.set(true);
    this.api.lostReports(this.filter.getRawValue()).subscribe({
      next: (reports) => { this.reports.set(reports); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('No se pudieron cargar los reportes'); }
    });
  }
  create() {
    this.api.createLost(this.form.getRawValue()).subscribe({
      next: () => { this.toast.success('Reporte de pérdida publicado'); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo publicar el reporte')
    });
  }
  share(report: LostReport) { navigator.share?.({ title: `Mascota perdida: ${report.pet.nombre}`, text: report.descripcion || '', url: location.href }); }
  canCreateLost() { return ['ADMIN', 'OWNER'].includes(this.auth.user()?.rol || ''); }
  canMarkFound(report: LostReport) { return this.auth.user()?.rol === 'ADMIN' || this.ownedPetIds().has(report.pet._id); }
  markFound(report: LostReport) {
    if (!confirm(`¿Marcar a ${report.pet.nombre} como encontrada? El reporte dejará de aparecer en perdidos.`)) return;
    this.api.markFound(report._id).subscribe({
      next: () => { this.toast.success(`${report.pet.nombre} fue marcada como encontrada`); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo marcar como encontrada')
    });
  }
  photos(pet: Pet) {
    const images = pet.fotos?.length ? pet.fotos : pet.foto ? [pet.foto] : [];
    return images.length ? images : ['https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=900&q=80'];
  }
  mainPhoto(pet: Pet) { return this.photos(pet)[0]; }
  coverPosition(pet: Pet) { return `${pet.fotoPosicionX ?? 50}% ${pet.fotoPosicionY ?? 50}%`; }
  openGallery(pet: Pet, index: number) {
    const photos = this.photos(pet);
    this.gallery.set({ name: pet.nombre, photos, index: Math.min(index, photos.length - 1) });
  }
  closeGallery() { this.gallery.set(null); }
}
