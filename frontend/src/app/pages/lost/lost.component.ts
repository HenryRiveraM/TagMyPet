import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { LostReport, Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
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
        <form class="mt-4 space-y-3" [formGroup]="form" (ngSubmit)="create()">
          <select class="field" formControlName="pet">@for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }} *</option> }</select>
          <input class="field" formControlName="ciudad" placeholder="Ciudad *">
          <input class="field" formControlName="zona" placeholder="Zona">
          <input class="field" formControlName="contactoPublico" placeholder="Teléfono público *">
          <textarea class="field" formControlName="descripcion" placeholder="Descripción"></textarea>
          <button class="btn w-full" [disabled]="form.invalid">Publicar</button>
        </form>
      </section>
      <section class="grid gap-4 md:grid-cols-2">
        @for (report of reports(); track report._id) {
          <article class="panel">
            <div class="mb-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md bg-stone-100">
              <img class="h-full w-full object-contain" [src]="report.pet.foto || 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=900&q=80'" [alt]="report.pet.nombre">
            </div>
            <h2 class="text-xl font-semibold">{{ report.pet.nombre }}</h2>
            <p class="text-sm text-slate-600">{{ report.ciudad }} · {{ report.zona || 'Zona no especificada' }}</p>
            <p class="mt-2 text-sm">{{ report.descripcion }}</p>
            <p class="mt-3 font-semibold text-brand">{{ report.contactoPublico }}</p>
            <button class="btn-outline mt-3" (click)="share(report)">Compartir</button>
          </article>
        }
      </section>
    </div>
  `
})
export class LostComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  reports = signal<LostReport[]>([]);
  pets = signal<Pet[]>([]);
  cities = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'];
  filter = this.fb.nonNullable.group({ texto: [''], ciudad: [''], especie: [''], raza: [''] });
  form = this.fb.nonNullable.group({
    pet: ['', Validators.required],
    ciudad: ['', Validators.required],
    zona: [''],
    contactoPublico: ['', Validators.required],
    descripcion: ['']
  });

  ngOnInit() { this.load(); this.api.pets().subscribe({ next: (pets) => { this.pets.set(pets); if (pets[0]) this.form.patchValue({ pet: pets[0]._id }); }, error: () => undefined }); }
  load() { this.api.lostReports(this.filter.getRawValue()).subscribe((reports) => this.reports.set(reports)); }
  create() { this.api.createLost(this.form.getRawValue()).subscribe(() => this.load()); }
  share(report: LostReport) { navigator.share?.({ title: `Mascota perdida: ${report.pet.nombre}`, text: report.descripcion || '', url: location.href }); }
}
