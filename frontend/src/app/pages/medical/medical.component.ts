import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section class="panel">
        <h1 class="text-2xl font-bold">Historial médico</h1>
        <form class="mt-5 space-y-3" [formGroup]="form" (ngSubmit)="create()">
          <select class="field" formControlName="pet" (change)="loadRecords()">
            @for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }}</option> }
          </select>
          <select class="field" formControlName="tipo">
            <option value="VACUNA">Vacuna</option>
            <option value="TRATAMIENTO">Tratamiento</option>
            <option value="CIRUGIA">Cirugía</option>
            <option value="ALERGIA">Alergia</option>
            <option value="CONTROL">Control</option>
          </select>
          <input class="field" formControlName="titulo" placeholder="Título">
          <textarea class="field" formControlName="descripcion" placeholder="Descripción"></textarea>
          <input class="field" type="date" formControlName="fecha">
          <button class="btn w-full" [disabled]="form.invalid">Agregar</button>
        </form>
      </section>
      <section class="space-y-3">
        @for (record of records(); track record._id) {
          <article class="panel">
            <div class="flex items-center justify-between gap-3">
              <h2 class="font-semibold">{{ record.titulo }}</h2>
              <span class="text-xs font-semibold text-brand">{{ record.tipo }}</span>
            </div>
            <p class="mt-2 text-sm text-slate-600">{{ record.descripcion }}</p>
            <p class="mt-2 text-xs text-slate-500">{{ record.fecha | date }}</p>
          </article>
        }
      </section>
    </div>
  `
})
export class MedicalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  pets = signal<Pet[]>([]);
  records = signal<any[]>([]);
  form = this.fb.nonNullable.group({
    pet: ['', Validators.required],
    tipo: ['VACUNA', Validators.required],
    titulo: ['', Validators.required],
    descripcion: [''],
    fecha: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  ngOnInit() {
    this.api.pets().subscribe((pets) => {
      this.pets.set(pets);
      if (pets[0]) this.form.patchValue({ pet: pets[0]._id });
      this.loadRecords();
    });
  }

  loadRecords() {
    const petId = this.form.controls.pet.value;
    if (petId) this.api.medicalRecords(petId).subscribe((records) => this.records.set(records as any[]));
  }

  create() {
    if (this.form.invalid) return;
    this.api.createMedicalRecord(this.form.getRawValue()).subscribe(() => this.loadRecords());
  }
}
