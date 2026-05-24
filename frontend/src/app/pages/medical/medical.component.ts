import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Pet } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { jsPDF } from 'jspdf';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section class="panel">
        <p class="eyebrow">Salud</p>
        <h1 class="text-2xl font-bold">Historial médico</h1>
        <p class="mt-2 text-sm text-slate-600">Los campos con * son obligatorios. El veterinario solo ve mascotas con acceso aprobado por el dueño/admin.</p>
        @if (pets().length) {
          <form class="mt-5 space-y-3" [formGroup]="form" (ngSubmit)="create()">
            <select class="field" formControlName="pet" (change)="loadRecords()">
              <option value="">Mascota *</option>
              @for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }}</option> }
            </select>
            <select class="field" formControlName="tipo">
              <option value="VACUNA">Vacuna *</option>
              <option value="TRATAMIENTO">Tratamiento</option>
              <option value="CIRUGIA">Cirugía</option>
              <option value="ALERGIA">Alergia</option>
              <option value="CONTROL">Control</option>
            </select>
            <input class="field" formControlName="titulo" placeholder="Título *">
            <textarea class="field" formControlName="descripcion" placeholder="Descripción"></textarea>
            <label class="block">
              <span class="mb-1.5 block text-sm font-semibold text-slate-700">Fecha *</span>
              <input class="field" type="date" formControlName="fecha">
            </label>
            @if (message()) { <p class="text-sm" [class.text-brand]="!isError()" [class.text-red-600]="isError()">{{ message() }}</p> }
            <button class="btn w-full" [disabled]="form.invalid">Agregar al historial</button>
          </form>
        } @else {
          <div class="mt-5 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">No hay mascotas disponibles para historial médico.</div>
        }
      </section>
      <section class="space-y-4">
        @if (loading()) {
          <article class="panel min-h-40 animate-pulse"><div class="h-5 w-32 rounded bg-stone-100"></div><div class="mt-5 h-4 w-2/3 rounded bg-stone-100"></div></article>
        }
        <div class="panel">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div class="flex flex-wrap gap-2">
            @for (type of types; track type.value) {
              <button type="button" class="btn-outline" [class.bg-brand]="activeType() === type.value" [class.text-white]="activeType() === type.value" (click)="activeType.set(type.value)">{{ type.label }} · {{ countByType(type.value) }}</button>
            }
          </div>
          @if (auth.user()?.plan === 'PREMIUM' && records().length) {
            <button type="button" class="btn-outline" (click)="exportHistory()">Exportar PDF</button>
          }
          </div>
        </div>
        @if (!filteredRecords().length) {
          <article class="panel text-center">
            <p class="eyebrow">Sin registros</p>
            <h2 class="mt-2 text-xl font-bold">Todavía no hay {{ activeTypeLabel().toLowerCase() }} para esta mascota</h2>
            <p class="mt-2 text-sm text-slate-600">Agrega vacunas, tratamientos, cirugías, alergias o controles desde el formulario.</p>
          </article>
        }
        @for (record of filteredRecords(); track record._id) {
          <article class="panel border-l-4 border-l-brand">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span class="badge">{{ record.tipo }}</span>
                <h2 class="mt-2 text-lg font-bold">{{ record.titulo }}</h2>
              </div>
              <p class="text-xs font-semibold text-slate-500">{{ record.fecha | date }}</p>
            </div>
            <p class="mt-3 text-sm text-slate-600">{{ record.descripcion || 'Sin descripción adicional.' }}</p>
            <p class="mt-3 text-xs text-slate-500">Registrado por: {{ record.registradoPor?.nombre || 'Sistema' }} {{ record.registradoPor?.apellido || '' }} · {{ record.registradoPor?.rol || 'Usuario' }}</p>
          </article>
        }
      </section>
    </div>
  `
})
export class MedicalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  pets = signal<Pet[]>([]);
  records = signal<any[]>([]);
  loading = signal(true);
  activeType = signal('VACUNA');
  types = [
    { value: 'VACUNA', label: 'Vacunas' },
    { value: 'TRATAMIENTO', label: 'Tratamientos' },
    { value: 'CIRUGIA', label: 'Cirugías' },
    { value: 'ALERGIA', label: 'Alergias' },
    { value: 'CONTROL', label: 'Controles' }
  ];
  message = signal('');
  isError = signal(false);
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
    if (!petId) {
      this.records.set([]);
      this.loading.set(false);
      return;
    }
    this.api.medicalRecords(petId).subscribe({
      next: (records) => { this.records.set(records as any[]); this.loading.set(false); },
      error: (err) => {
        this.loading.set(false);
        this.isError.set(true);
        this.message.set(err.error?.message || 'No se pudo cargar el historial');
        this.toast.error(err.error?.message || 'No se pudo cargar el historial');
        this.records.set([]);
      }
    });
  }

  create() {
    if (this.form.invalid) return;
    this.message.set('');
    this.isError.set(false);
    this.api.createMedicalRecord(this.form.getRawValue()).subscribe({
      next: () => {
        this.message.set('Registro médico agregado');
        this.toast.success('Registro médico agregado');
        this.form.patchValue({ titulo: '', descripcion: '' });
        this.loadRecords();
      },
      error: (err) => {
        this.isError.set(true);
        this.message.set(err.error?.message || 'No se pudo agregar el registro');
        this.toast.error(err.error?.message || 'No se pudo agregar el registro');
      }
    });
  }

  filteredRecords() { return this.records().filter((record) => record.tipo === this.activeType()); }
  countByType(type: string) { return this.records().filter((record) => record.tipo === type).length; }
  activeTypeLabel() { return this.types.find((type) => type.value === this.activeType())?.label || 'registros'; }
  exportHistory() {
    const pet = this.pets().find((item) => item._id === this.form.controls.pet.value);
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Historial clinico - ${pet?.nombre || 'Mascota'}`, 18, 22);
    doc.setFontSize(10);
    let y = 38;
    for (const record of this.records()) {
      const text = `${record.tipo} | ${record.titulo} | ${new Date(record.fecha).toLocaleDateString()}\n${record.descripcion || 'Sin descripcion'}`;
      doc.text(doc.splitTextToSize(text, 175), 18, y);
      y += 20;
      if (y > 270) { doc.addPage(); y = 20; }
    }
    doc.save(`historial-${(pet?.nombre || 'mascota').toLowerCase()}.pdf`);
    this.toast.success('Historial PDF generado');
  }
}
