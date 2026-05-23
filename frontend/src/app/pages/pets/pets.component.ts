import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Pet } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section class="panel h-fit lg:sticky lg:top-28">
        <p class="eyebrow">{{ editingId() ? 'Edición' : 'Registro' }}</p>
        <h1 class="mt-2 text-2xl font-bold tracking-tight">Mascotas</h1>
        <form class="mt-5 space-y-3" [formGroup]="form" (ngSubmit)="create()">
          <input class="field" formControlName="nombre" placeholder="Nombre *">
          <select class="field" formControlName="especie">
            <option value="">Especie *</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
          @if (form.controls.especie.value === 'Otro') {
            <input class="field" formControlName="especieOtra" placeholder="Especifica la especie *">
          }
          <input class="field" formControlName="raza" placeholder="Raza">
          <label class="block">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Edad de la mascota (años)</span>
            <input class="field" formControlName="edad" placeholder="Ej. 2" type="number" min="0">
          </label>
          <select class="field" formControlName="sexo">
            <option value="DESCONOCIDO">Sexo</option>
            <option value="MACHO">Macho</option>
            <option value="HEMBRA">Hembra</option>
          </select>
          <input class="field" formControlName="color" placeholder="Color">
          <div class="rounded-md bg-stone-100 p-3 text-sm text-slate-600">
            El código NFC lo genera TagMyPet automáticamente al guardar. Luego podrás copiar el código o el link público de la mascota.
          </div>
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="esterilizado"> Esterilizado</label>
          <label class="block">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Fotos de la mascota (máximo 5)</span>
            <input #fileInput class="field" type="file" accept="image/*" multiple (change)="pickFiles($event)">
          </label>
          @if (previewPhoto(); as preview) {
            <section class="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-bold text-slate-900">Encuadre de portada</p>
                <span class="text-xs text-slate-500">Arrastra los controles</span>
              </div>
              <p class="mt-1 text-xs leading-5 text-slate-600">Acomoda la cara de tu mascota. La foto completa seguirá visible en la galería.</p>
              <div class="mt-3 aspect-[4/3] overflow-hidden rounded-md bg-stone-200">
                <img class="h-full w-full object-cover" [style.object-position]="previewPosition()" [src]="preview" alt="Vista previa de portada">
              </div>
              <label class="mt-3 block text-xs font-semibold text-slate-600">
                Horizontal
                <input class="mt-1 w-full accent-slate-950" type="range" min="0" max="100" formControlName="fotoPosicionX">
              </label>
              <label class="mt-2 block text-xs font-semibold text-slate-600">
                Vertical
                <input class="mt-1 w-full accent-slate-950" type="range" min="0" max="100" formControlName="fotoPosicionY">
              </label>
            </section>
          }
          <label class="flex items-start gap-3 rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-slate-700">
            <input class="mt-1" type="checkbox" formControlName="consentimientoPerfilPublico">
            <span>Autorizo que la foto principal, datos críticos y mi teléfono sean visibles en el perfil público NFC para identificación o emergencia. *</span>
          </label>
          @if (message()) { <p class="text-sm" [class.text-brand]="!isError()" [class.text-red-600]="isError()">{{ message() }}</p> }
          <div class="grid gap-2 sm:grid-cols-2">
            <button class="btn w-full" [disabled]="form.invalid || saving()">{{ saving() ? 'Guardando...' : editingId() ? 'Actualizar mascota' : 'Guardar mascota' }}</button>
            @if (editingId()) { <button type="button" class="btn-outline w-full" (click)="cancelEdit()">Cancelar</button> }
          </div>
        </form>
      </section>
      <section class="grid gap-4 md:grid-cols-2">
        @if (loading()) {
          @for (item of [1,2,3,4]; track item) {
            <article class="panel min-h-72 animate-pulse"><div class="h-44 rounded-md bg-stone-100"></div><div class="mt-5 h-5 w-1/2 rounded bg-stone-100"></div><div class="mt-3 h-4 w-2/3 rounded bg-stone-100"></div></article>
          }
        }
        @if (!pets().length && !loading()) {
          <article class="panel text-center md:col-span-2">
            <p class="eyebrow">Sin mascotas</p>
            <h2 class="mt-2 text-2xl font-bold">Registra tu primera mascota</h2>
            <p class="mt-2 text-sm text-slate-600">Al crearla, TagMyPet generará su código NFC y perfil público automáticamente.</p>
          </article>
        }
        @for (pet of pets(); track pet._id) {
          <article class="panel overflow-hidden p-0">
            <button type="button" class="flex aspect-[4/3] w-full items-center justify-center bg-stone-100" (click)="openGallery(pet, 0)">
              <img class="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" [style.object-position]="coverPosition(pet)" [src]="mainPhoto(pet)" [alt]="pet.nombre">
            </button>
            <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-xl font-semibold">{{ pet.nombre }}</h2>
                <p class="text-sm text-slate-600">{{ pet.especie }} · {{ pet.raza || 'Sin raza' }} · {{ pet.estado }}</p>
              </div>
              <span class="badge max-w-[180px] break-all">{{ pet.codigoNFC }}</span>
            </div>
            <div class="mt-4 rounded-md bg-stone-100 p-3">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Código NFC generado por la app</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button class="btn-outline" (click)="copyText(pet.codigoNFC, 'Código NFC copiado')">Copiar código</button>
                <button class="btn-outline" (click)="copyText(publicProfileUrl(pet), 'Link público copiado')">Copiar link</button>
              </div>
              <a class="mt-3 block break-all text-sm font-semibold text-brand" [routerLink]="['/pet/public', pet.codigoNFC]">{{ publicProfileUrl(pet) }}</a>
            </div>
            @if ((pet.fotos?.length || 0) > 1) {
              <div class="mt-4 grid grid-cols-5 gap-2">
                @for (photo of pet.fotos?.slice(0, 5); track photo; let i = $index) {
                  <button type="button" class="overflow-hidden rounded-md bg-stone-100 ring-brand/20 transition hover:ring-4" (click)="openGallery(pet, i)">
                    <img class="aspect-square w-full object-cover" [src]="photo" [alt]="pet.nombre + ' foto ' + (i + 1)">
                  </button>
                }
              </div>
              <button type="button" class="mt-3 text-sm font-semibold text-brand" (click)="openGallery(pet, 0)">Ver todas las fotos</button>
            } @else {
              <button type="button" class="mt-3 text-sm font-semibold text-brand" (click)="openGallery(pet, 0)">Ver foto completa</button>
            }
            <div class="mt-4 flex gap-2">
              <button class="btn-outline" (click)="edit(pet)">Editar</button>
              <button class="btn-outline" (click)="remove(pet)">Eliminar</button>
            </div>
            </div>
          </article>
        }
      </section>
    </div>

    @if (gallery(); as view) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" (click)="closeGallery()">
        <section class="relative w-full max-w-5xl rounded-lg bg-white p-4 shadow-2xl" (click)="$event.stopPropagation()">
          <div class="mb-3 flex items-center justify-between gap-3">
            <div>
              <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Galería</p>
              <h2 class="text-xl font-bold">{{ view.name }}</h2>
            </div>
            <button type="button" class="btn-outline" (click)="closeGallery()">Cerrar</button>
          </div>
          <div class="flex min-h-[320px] items-center justify-center rounded-lg bg-stone-100 md:min-h-[560px]">
            <img class="max-h-[72vh] w-full object-contain" [src]="view.photos[view.index]" [alt]="view.name">
          </div>
          @if (view.photos.length > 1) {
            <div class="mt-4 flex items-center justify-between gap-3">
              <button type="button" class="btn-outline" (click)="previousPhoto()">Anterior</button>
              <p class="text-sm font-semibold text-slate-600">{{ view.index + 1 }} / {{ view.photos.length }}</p>
              <button type="button" class="btn-outline" (click)="nextPhoto()">Siguiente</button>
            </div>
            <div class="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
              @for (photo of view.photos; track photo; let i = $index) {
                <button type="button" class="overflow-hidden rounded-md bg-stone-100 ring-offset-2 transition" [class.ring-4]="i === view.index" [class.ring-brand]="i === view.index" (click)="setPhoto(i)">
                  <img class="aspect-square w-full object-contain" [src]="photo" [alt]="view.name + ' miniatura ' + (i + 1)">
                </button>
              }
            </div>
          }
        </section>
      </div>
    }
  `
})
export class PetsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  pets = signal<Pet[]>([]);
  message = signal('');
  isError = signal(false);
  saving = signal(false);
  loading = signal(true);
  editingId = signal<string | null>(null);
  previewPhoto = signal<string | null>(null);
  gallery = signal<{ name: string; photos: string[]; index: number } | null>(null);
  files: File[] = [];
  private localPreviewUrl: string | null = null;
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    especie: ['', Validators.required],
    especieOtra: [''],
    raza: [''],
    edad: [0],
    sexo: ['DESCONOCIDO'],
    color: [''],
    esterilizado: [false],
    fotoPosicionX: [50],
    fotoPosicionY: [50],
    consentimientoPerfilPublico: [false, Validators.requiredTrue]
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.pets().subscribe({ next: (pets) => { this.pets.set(pets); this.loading.set(false); }, error: () => { this.loading.set(false); this.toast.error('No se pudieron cargar las mascotas'); } });
  }

  pickFiles(event: Event) {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files || []);
    if (selected.length > 5) {
      this.isError.set(true);
      this.message.set('Puedes subir máximo 5 fotos por mascota.');
      input.value = '';
      this.files = [];
      this.setPreview(null);
      return;
    }
    this.files = selected;
    this.setPreview(selected[0] ? URL.createObjectURL(selected[0]) : null, Boolean(selected[0]));
  }

  create() {
    if (this.form.invalid || this.saving()) return;
    if (this.form.controls.especie.value === 'Otro' && !this.form.controls.especieOtra.value.trim()) {
      this.isError.set(true);
      this.message.set('Especifica la especie de la mascota.');
      return;
    }
    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);
    const data = new FormData();
    const raw = this.form.getRawValue();
    Object.entries(raw).forEach(([key, value]) => {
      if (key === 'especieOtra') return;
      const resolved = key === 'especie' && raw.especie === 'Otro' ? raw.especieOtra : value;
      data.append(key, String(resolved ?? ''));
    });
    this.files.forEach((file) => data.append('fotos', file));
    const wasEditing = Boolean(this.editingId());
    const request = wasEditing ? this.api.updatePet(this.editingId() as string, data) : this.api.createPet(data);
    request.subscribe({
      next: () => {
        this.cancelEdit(false);
        this.files = [];
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        this.message.set(wasEditing ? 'Mascota actualizada' : 'Mascota creada');
        this.toast.success(wasEditing ? 'Mascota actualizada' : 'Mascota creada');
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.isError.set(true);
        this.message.set(err.error?.message || 'No se pudo crear');
        this.toast.error(err.error?.message || 'No se pudo guardar la mascota');
        this.saving.set(false);
      }
    });
  }

  edit(pet: Pet) {
    const knownSpecies = ['Perro', 'Gato'];
    const isKnownSpecies = knownSpecies.includes(pet.especie);
    this.editingId.set(pet._id);
    this.message.set('');
    this.form.patchValue({
      nombre: pet.nombre,
      especie: isKnownSpecies ? pet.especie : 'Otro',
      especieOtra: isKnownSpecies ? '' : pet.especie,
      raza: pet.raza || '',
      edad: pet.edad || 0,
      sexo: pet.sexo || 'DESCONOCIDO',
      color: pet.color || '',
      esterilizado: Boolean(pet.esterilizado),
      fotoPosicionX: pet.fotoPosicionX ?? 50,
      fotoPosicionY: pet.fotoPosicionY ?? 50,
      consentimientoPerfilPublico: true
    });
    this.setPreview(this.mainPhoto(pet));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(clearMessage = true) {
    this.editingId.set(null);
    this.form.reset({ especie: '', especieOtra: '', sexo: 'DESCONOCIDO', edad: 0, esterilizado: false, fotoPosicionX: 50, fotoPosicionY: 50, consentimientoPerfilPublico: false });
    this.files = [];
    this.setPreview(null);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    if (clearMessage) this.message.set('');
  }

  remove(pet: Pet) {
    if (!confirm(`¿Eliminar a ${pet.nombre}? Esta acción no se puede deshacer.`)) return;
    this.api.deletePet(pet._id).subscribe({
      next: () => { this.message.set('Mascota eliminada'); this.toast.success('Mascota eliminada'); this.load(); },
      error: (err) => { this.isError.set(true); this.message.set(err.error?.message || 'No se pudo eliminar'); this.toast.error(err.error?.message || 'No se pudo eliminar'); }
    });
  }

  publicProfileUrl(pet: Pet) {
    return `${location.origin}/#/pet/public/${encodeURIComponent(pet.codigoNFC)}`;
  }

  mainPhoto(pet: Pet) {
    return this.photos(pet)[0];
  }

  coverPosition(pet: Pet) {
    return `${pet.fotoPosicionX ?? 50}% ${pet.fotoPosicionY ?? 50}%`;
  }

  previewPosition() {
    return `${this.form.controls.fotoPosicionX.value}% ${this.form.controls.fotoPosicionY.value}%`;
  }

  photos(pet: Pet) {
    const images = pet.fotos?.length ? pet.fotos : pet.foto ? [pet.foto] : [];
    return images.length ? images : ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'];
  }

  openGallery(pet: Pet, index: number) {
    const photos = this.photos(pet);
    this.gallery.set({ name: pet.nombre, photos, index: Math.min(index, photos.length - 1) });
  }

  closeGallery() { this.gallery.set(null); }

  setPhoto(index: number) {
    const view = this.gallery();
    if (!view) return;
    this.gallery.set({ ...view, index });
  }

  previousPhoto() {
    const view = this.gallery();
    if (!view) return;
    this.gallery.set({ ...view, index: (view.index - 1 + view.photos.length) % view.photos.length });
  }

  nextPhoto() {
    const view = this.gallery();
    if (!view) return;
    this.gallery.set({ ...view, index: (view.index + 1) % view.photos.length });
  }

  copyText(value: string, message: string) {
    navigator.clipboard?.writeText(value);
    this.isError.set(false);
    this.message.set(message);
    this.toast.success(message);
  }

  private setPreview(url: string | null, local = false) {
    if (this.localPreviewUrl) URL.revokeObjectURL(this.localPreviewUrl);
    this.localPreviewUrl = local ? url : null;
    this.previewPhoto.set(url);
  }
}
