import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Adoption, Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold">Adopciones responsables</h1>
      <p class="text-slate-600">Publicaciones abiertas con cuestionario y firma digital.</p>
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
      <section class="panel">
        <h2 class="font-semibold">Publicar adopción</h2>
        <form class="mt-4 space-y-3" [formGroup]="publishForm" (ngSubmit)="publish()">
          <select class="field" formControlName="pet">@for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }} *</option> }</select>
          <input class="field" formControlName="ciudad" placeholder="Ciudad *">
          <textarea class="field" formControlName="descripcion" placeholder="Descripción *"></textarea>
          <button class="btn w-full" [disabled]="publishForm.invalid">Publicar</button>
        </form>
      </section>
      <section class="grid gap-4">
        @for (adoption of adoptions(); track adoption._id) {
          <article class="panel grid gap-4 md:grid-cols-[220px_1fr]">
            <div class="flex aspect-[4/3] w-full items-center justify-center rounded-md bg-stone-100 md:h-48">
              <img class="h-full w-full object-contain" [src]="adoption.pet.foto || 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=900&q=80'" [alt]="adoption.pet.nombre">
            </div>
            <div>
              <h2 class="text-xl font-semibold">{{ adoption.pet.nombre }}</h2>
              <p class="text-sm text-slate-600">{{ adoption.ciudad }} · {{ adoption.pet.especie }} · {{ adoption.pet.edad || 0 }} años</p>
              <p class="mt-2 text-sm">{{ adoption.descripcion }}</p>
              <form class="mt-4 grid gap-2 md:grid-cols-2" [formGroup]="applyForm" (ngSubmit)="apply(adoption._id)">
                <input class="field" formControlName="espacio" placeholder="Espacio disponible *">
                <input class="field" formControlName="experiencia" placeholder="Experiencia *">
                <input class="field" formControlName="recursos" placeholder="Recursos *">
                <input class="field" formControlName="compromiso" placeholder="Compromiso *">
                <input class="field md:col-span-2" formControlName="firmaDigital" placeholder="Firma digital *">
                <button class="btn md:col-span-2" [disabled]="applyForm.invalid">Solicitar adopción</button>
              </form>
            </div>
          </article>
        }
      </section>
    </div>
  `
})
export class AdoptionsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  adoptions = signal<Adoption[]>([]);
  pets = signal<Pet[]>([]);
  filter = this.fb.nonNullable.group({ especie: [''], raza: [''], edad: [''] });
  publishForm = this.fb.nonNullable.group({ pet: ['', Validators.required], ciudad: ['', Validators.required], descripcion: ['', Validators.required] });
  applyForm = this.fb.nonNullable.group({
    espacio: ['', Validators.required],
    experiencia: ['', Validators.required],
    recursos: ['', Validators.required],
    compromiso: ['', Validators.required],
    firmaDigital: ['', Validators.required]
  });

  ngOnInit() { this.load(); this.api.pets().subscribe({ next: (pets) => { this.pets.set(pets); if (pets[0]) this.publishForm.patchValue({ pet: pets[0]._id }); }, error: () => undefined }); }
  load() { this.api.adoptions(this.filter.getRawValue()).subscribe((adoptions) => this.adoptions.set(adoptions)); }
  publish() { this.api.createAdoption({ ...this.publishForm.getRawValue(), requisitos: ['Seguimiento veterinario'] }).subscribe(() => this.load()); }
  apply(id: string) {
    const { firmaDigital, ...cuestionario } = this.applyForm.getRawValue();
    this.api.applyAdoption(id, { firmaDigital, cuestionario }).subscribe(() => this.applyForm.reset());
  }
}
