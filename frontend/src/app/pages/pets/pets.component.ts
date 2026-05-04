import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="grid gap-6 lg:grid-cols-[380px_1fr]">
      <section class="panel">
        <h1 class="text-2xl font-bold">Mascotas</h1>
        <form class="mt-5 space-y-3" [formGroup]="form" (ngSubmit)="create()">
          <input class="field" formControlName="nombre" placeholder="Nombre">
          <input class="field" formControlName="especie" placeholder="Especie">
          <input class="field" formControlName="raza" placeholder="Raza">
          <input class="field" formControlName="edad" placeholder="Edad" type="number">
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
          <article class="panel">
            <img class="mb-4 h-44 w-full rounded-md object-cover bg-slate-100" [src]="pet.foto || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'" [alt]="pet.nombre">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-xl font-semibold">{{ pet.nombre }}</h2>
                <p class="text-sm text-slate-600">{{ pet.especie }} · {{ pet.raza || 'Sin raza' }} · {{ pet.estado }}</p>
              </div>
              <span class="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-brand">{{ pet.codigoNFC }}</span>
            </div>
            <a class="mt-4 block text-sm text-brand" [href]="'/pet/public/' + pet.codigoNFC">Perfil NFC público</a>
            <div class="mt-4 flex gap-2">
              <button class="btn-outline" (click)="edit(pet)">Editar</button>
              <button class="btn-outline" (click)="remove(pet)">Eliminar</button>
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
    this.saving.set(true);
    this.message.set('');
    this.isError.set(false);
    const data = new FormData();
    Object.entries(this.form.getRawValue()).forEach(([key, value]) => data.append(key, String(value ?? '')));
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
    this.editingId.set(pet._id);
    this.message.set('');
    this.form.patchValue({
      nombre: pet.nombre,
      especie: pet.especie,
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
    this.form.reset({ sexo: 'DESCONOCIDO', edad: 0, esterilizado: false });
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
}
