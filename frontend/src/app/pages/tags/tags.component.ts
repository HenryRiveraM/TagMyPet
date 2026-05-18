import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-3xl">
      <div class="mb-6">
        <p class="eyebrow">NFC Tools</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight">Crear link NFC</h1>
        <p class="mt-2 text-slate-600">Selecciona la mascota, copia su link público y pégalo en NFC Tools para grabar el collar. NFC Tools está disponible en Apple y Android.</p>
      </div>

      <section class="panel">
        @if (pets().length) {
          <form class="space-y-5" [formGroup]="form">
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700">Mascota</span>
              <select class="field" formControlName="pet">
                @for (pet of pets(); track pet._id) {
                  <option [value]="pet._id">{{ pet.nombre }} · {{ pet.especie }}</option>
                }
              </select>
            </label>

            @if (selectedPet(); as pet) {
              <div class="grid gap-4 md:grid-cols-[160px_1fr] md:items-center">
                <div class="flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-stone-100">
                  <img class="h-full w-full object-contain" [src]="pet.foto || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'" [alt]="pet.nombre">
                </div>
                <div>
                  <span class="badge">Perfil público</span>
                  <h2 class="mt-3 text-2xl font-bold">{{ pet.nombre }}</h2>
                  <p class="mt-1 text-sm text-slate-600">{{ pet.especie }} · {{ pet.raza || 'Sin raza' }}</p>
                  <p class="mt-2 break-all text-xs font-semibold text-slate-500">Código NFC: {{ pet.codigoNFC }}</p>
                </div>
              </div>

              <div class="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Link que debes poner en NFC Tools</p>
                <p class="mt-2 break-all text-sm font-semibold text-slate-950">{{ publicProfileUrl(pet) }}</p>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <button class="btn" type="button" (click)="copyLink(pet)">Copiar link</button>
                <a class="btn-outline" [href]="publicProfileUrl(pet)" target="_blank">Ver perfil</a>
              </div>

              @if (message()) {
                <div class="rounded-lg border border-stone-200 bg-white p-4 text-sm text-slate-700">
                  {{ message() }}
                </div>
              }

              <div class="rounded-lg bg-slate-950 p-4 text-sm text-white">
                <p class="font-semibold">Cómo grabarlo</p>
                <ol class="mt-2 list-decimal space-y-1 pl-5 text-slate-200">
                  <li>Abre NFC Tools en tu celular Apple o Android.</li>
                  <li>Elige escribir una URL o enlace.</li>
                  <li>Pega el link copiado.</li>
                  <li>Acerca el collar NFC y grábalo.</li>
                  <li>Escanea el collar para confirmar que abre este perfil.</li>
                </ol>
              </div>
            }
          </form>
        } @else {
          <div class="rounded-lg bg-stone-100 p-5">
            <h2 class="font-semibold">No tienes mascotas registradas</h2>
            <p class="mt-2 text-sm text-slate-600">Primero crea una mascota en Mis mascotas. TagMyPet generará su código NFC automáticamente.</p>
          </div>
        }
      </section>
    </section>
  `
})
export class TagsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  pets = signal<Pet[]>([]);
  message = signal('');
  form = this.fb.nonNullable.group({ pet: ['', Validators.required] });

  ngOnInit() {
    this.api.pets().subscribe((pets) => {
      this.pets.set(pets);
      if (pets[0]) this.form.patchValue({ pet: pets[0]._id });
    });
  }

  selectedPet() {
    return this.pets().find((pet) => pet._id === this.form.controls.pet.value) || null;
  }

  publicProfileUrl(pet: Pet) {
    return `${location.origin}/#/pet/public/${encodeURIComponent(pet.codigoNFC)}`;
  }

  copyLink(pet: Pet) {
    const url = this.publicProfileUrl(pet);
    navigator.clipboard?.writeText(url);
    this.message.set('Link copiado. Ahora pégalo en NFC Tools como URL del collar.');
  }
}
