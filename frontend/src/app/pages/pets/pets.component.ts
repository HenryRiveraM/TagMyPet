import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section class="panel h-fit lg:sticky lg:top-28">
        <p class="eyebrow">{{ editingId() ? 'Edición' : 'Registro' }}</p>
        <h1 class="mt-2 text-2xl font-bold tracking-tight">Mascotas</h1>
        <form class="mt-5 space-y-3" [formGroup]="form" (ngSubmit)="create()">
          <input class="field" formControlName="nombre" placeholder="Nombre">
          <select class="field" formControlName="especie">
            <option value="">Especie</option>
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Otro">Otro</option>
          </select>
          @if (form.controls.especie.value === 'Otro') {
            <input class="field" formControlName="especieOtra" placeholder="Especifica la especie">
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
          <input class="field" formControlName="codigoNFC" placeholder="Código NFC opcional">
          <label class="flex items-center gap-2 text-sm"><input type="checkbox" formControlName="esterilizado"> Esterilizado</label>
          <input #fileInput class="field" type="file" accept="image/*" (change)="pickFile($event)">
          @if (message()) { <p class="text-sm" [class.text-brand]="!isError()" [class.text-red-600]="isError()">{{ message() }}</p> }
          <div class="grid gap-2 sm:grid-cols-2">
            <button class="btn w-full" [disabled]="form.invalid || saving()">{{ saving() ? 'Guardando...' : editingId() ? 'Actualizar mascota' : 'Guardar mascota' }}</button>
            @if (editingId()) { <button type="button" class="btn-outline w-full" (click)="cancelEdit()">Cancelar</button> }
          </div>
        </form>
      </section>
      <section class="grid gap-4 md:grid-cols-2">
        @for (pet of pets(); track pet._id) {
          <article class="panel overflow-hidden p-0">
            <div class="flex aspect-[4/3] w-full items-center justify-center bg-stone-100">
              <img class="h-full w-full object-contain" [src]="pet.foto || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'" [alt]="pet.nombre">
            </div>
            <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-xl font-semibold">{{ pet.nombre }}</h2>
                <p class="text-sm text-slate-600">{{ pet.especie }} · {{ pet.raza || 'Sin raza' }} · {{ pet.estado }}</p>
              </div>
              <span class="badge max-w-[180px] break-all">{{ pet.codigoNFC }}</span>
            </div>
            <div class="mt-4 rounded-md bg-stone-100 p-3">
              <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Perfil que abre el NFC</p>
              <a class="mt-1 block break-all text-sm font-semibold text-brand" [routerLink]="['/pet/public', pet.codigoNFC]">{{ publicProfileUrl(pet) }}</a>
            </div>
            <div class="mt-4 flex gap-2">
              <button class="btn-outline" (click)="edit(pet)">Editar</button>
              <button class="btn-outline" (click)="remove(pet)">Eliminar</button>
            </div>
            </div>
          </article>
        }
      </section>
    </div>
  `
})
export class PetsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  @ViewChild('fileInput') fileInput?: ElementRef<HTMLInputElement>;
  pets = signal<Pet[]>([]);
  message = signal('');
  isError = signal(false);
  saving = signal(false);
  editingId = signal<string | null>(null);
  file: File | null = null;
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    especie: ['', Validators.required],
    especieOtra: [''],
    raza: [''],
    edad: [0],
    sexo: ['DESCONOCIDO'],
    color: [''],
    codigoNFC: [''],
    esterilizado: [false]
  });

  ngOnInit() { this.load(); }

  load() { this.api.pets().subscribe((pets) => this.pets.set(pets)); }

  pickFile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0] || null;
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
    if (this.file) data.append('foto', this.file);
    const wasEditing = Boolean(this.editingId());
    const request = wasEditing ? this.api.updatePet(this.editingId() as string, data) : this.api.createPet(data);
    request.subscribe({
      next: () => {
        this.cancelEdit(false);
        this.file = null;
        if (this.fileInput) this.fileInput.nativeElement.value = '';
        this.message.set(wasEditing ? 'Mascota actualizada' : 'Mascota creada');
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.isError.set(true);
        this.message.set(err.error?.message || 'No se pudo crear');
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
      codigoNFC: pet.codigoNFC,
      esterilizado: Boolean(pet.esterilizado)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(clearMessage = true) {
    this.editingId.set(null);
    this.form.reset({ especie: '', especieOtra: '', sexo: 'DESCONOCIDO', edad: 0, esterilizado: false });
    this.file = null;
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    if (clearMessage) this.message.set('');
  }

  remove(pet: Pet) {
    if (!confirm(`¿Eliminar a ${pet.nombre}? Esta acción no se puede deshacer.`)) return;
    this.api.deletePet(pet._id).subscribe({
      next: () => { this.message.set('Mascota eliminada'); this.load(); },
      error: (err) => { this.isError.set(true); this.message.set(err.error?.message || 'No se pudo eliminar'); }
    });
  }

  publicProfileUrl(pet: Pet) {
    return `${location.origin}/#/pet/public/${encodeURIComponent(pet.codigoNFC)}`;
  }
}
