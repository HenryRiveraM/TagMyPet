import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Pet, Reminder } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section class="panel">
        <h1 class="text-2xl font-bold">Recordatorios</h1>
        <form class="mt-5 space-y-3" [formGroup]="form" (ngSubmit)="create()">
          <select class="field" formControlName="pet">@for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }} *</option> }</select>
          <select class="field" formControlName="tipo"><option value="VACUNA">Vacuna *</option><option value="MEDICACION">Medicación *</option><option value="CONTROL">Control *</option></select>
          <input class="field" formControlName="titulo" placeholder="Título *">
          <label class="block">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Fecha *</span>
            <input class="field" type="date" formControlName="fecha">
          </label>
          <button class="btn w-full" [disabled]="form.invalid">Crear alerta</button>
        </form>
      </section>
      <section class="grid gap-3 md:grid-cols-2">
        @for (reminder of reminders(); track reminder._id) {
          <article class="panel" [class.opacity-50]="reminder.completado">
            <p class="text-xs font-semibold text-brand">{{ reminder.tipo }}</p>
            <h2 class="font-semibold">{{ reminder.titulo }}</h2>
            <p class="text-sm text-slate-600">{{ reminder.pet.nombre }} · {{ reminder.fecha | date }}</p>
            <button class="btn-outline mt-4" (click)="toggle(reminder._id)">Cambiar estado</button>
          </article>
        }
      </section>
    </div>
  `
})
export class RemindersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  pets = signal<Pet[]>([]);
  reminders = signal<Reminder[]>([]);
  form = this.fb.nonNullable.group({
    pet: ['', Validators.required],
    tipo: ['VACUNA', Validators.required],
    titulo: ['', Validators.required],
    fecha: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  ngOnInit() { this.api.pets().subscribe((pets) => { this.pets.set(pets); if (pets[0]) this.form.patchValue({ pet: pets[0]._id }); }); this.load(); }
  load() { this.api.reminders().subscribe((reminders) => this.reminders.set(reminders)); }
  create() { this.api.createReminder(this.form.getRawValue()).subscribe(() => this.load()); }
  toggle(id: string) { this.api.toggleReminder(id).subscribe(() => this.load()); }
}
