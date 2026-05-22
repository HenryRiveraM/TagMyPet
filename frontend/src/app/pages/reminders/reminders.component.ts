import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Pet, Reminder } from '../../core/models/domain';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  template: `
    <div class="grid gap-6 lg:grid-cols-[340px_1fr]">
      <section class="panel">
        <p class="eyebrow">Alertas</p>
        <h1 class="text-2xl font-bold">Recordatorios</h1>
        <p class="mt-2 text-sm text-slate-600">Organiza vacunas, medicación y controles por estado.</p>
        @if (pets().length) {
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
        } @else {
          <div class="mt-5 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-slate-600">Registra una mascota para crear recordatorios.</div>
        }
      </section>
      <section class="space-y-4">
        @if (loading()) {
          <div class="grid gap-3 md:grid-cols-3">
            @for (item of [1,2,3]; track item) {
              <article class="panel min-h-28 animate-pulse"><div class="h-4 w-20 rounded bg-stone-100"></div><div class="mt-4 h-8 w-12 rounded bg-stone-100"></div></article>
            }
          </div>
          @for (item of [1,2,3]; track item) {
            <article class="panel min-h-32 animate-pulse"><div class="h-5 w-24 rounded bg-stone-100"></div><div class="mt-4 h-5 w-1/2 rounded bg-stone-100"></div><div class="mt-3 h-4 w-2/3 rounded bg-stone-100"></div></article>
          }
        }
        <div class="grid gap-3 md:grid-cols-3">
          <article class="panel"><p class="text-sm text-slate-500">Vencidos</p><p class="mt-2 text-3xl font-bold text-red-600">{{ overdue().length }}</p></article>
          <article class="panel"><p class="text-sm text-slate-500">Próximos</p><p class="mt-2 text-3xl font-bold text-brand">{{ upcoming().length }}</p></article>
          <article class="panel"><p class="text-sm text-slate-500">Completados</p><p class="mt-2 text-3xl font-bold text-slate-500">{{ completed().length }}</p></article>
        </div>
        @if (!reminders().length && !loading()) {
          <article class="panel text-center">
            <p class="eyebrow">Sin alertas</p>
            <h2 class="mt-2 text-xl font-bold">Crea tu primer recordatorio</h2>
            <p class="mt-2 text-sm text-slate-600">Te ayudará a no olvidar vacunas, medicación y controles.</p>
          </article>
        }
        @for (reminder of sortedReminders(); track reminder._id) {
          <article class="panel border-l-4" [class.border-l-red-500]="status(reminder) === 'Vencido'" [class.border-l-brand]="status(reminder) === 'Próximo'" [class.border-l-slate-300]="status(reminder) === 'Completado'" [class.opacity-60]="reminder.completado">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span class="badge">{{ reminder.tipo }}</span>
                <h2 class="mt-2 text-lg font-bold">{{ reminder.titulo }}</h2>
                <p class="text-sm text-slate-600">{{ reminder.pet.nombre }} · {{ reminder.fecha | date }}</p>
              </div>
              <span class="rounded-md px-3 py-1 text-xs font-bold" [class.bg-red-50]="status(reminder) === 'Vencido'" [class.text-red-700]="status(reminder) === 'Vencido'" [class.bg-stone-100]="status(reminder) !== 'Vencido'">{{ status(reminder) }}</span>
            </div>
            <button class="btn-outline mt-4" (click)="toggle(reminder._id)">{{ reminder.completado ? 'Reabrir' : 'Marcar como completado' }}</button>
          </article>
        }
      </section>
    </div>
  `
})
export class RemindersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  pets = signal<Pet[]>([]);
  reminders = signal<Reminder[]>([]);
  loading = signal(true);
  form = this.fb.nonNullable.group({
    pet: ['', Validators.required],
    tipo: ['VACUNA', Validators.required],
    titulo: ['', Validators.required],
    fecha: [new Date().toISOString().slice(0, 10), Validators.required]
  });

  ngOnInit() { this.api.pets().subscribe((pets) => { this.pets.set(pets); if (pets[0]) this.form.patchValue({ pet: pets[0]._id }); }); this.load(); }
  load() {
    this.loading.set(true);
    this.api.reminders().subscribe({
      next: (reminders) => { this.reminders.set(reminders); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('No se pudieron cargar los recordatorios'); }
    });
  }
  create() {
    this.api.createReminder(this.form.getRawValue()).subscribe({
      next: () => { this.toast.success('Recordatorio creado'); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo crear el recordatorio')
    });
  }
  toggle(id: string) {
    this.api.toggleReminder(id).subscribe({
      next: () => { this.toast.success('Estado del recordatorio actualizado'); this.load(); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar el recordatorio')
    });
  }
  status(reminder: Reminder) {
    if (reminder.completado) return 'Completado';
    const today = new Date().setHours(0, 0, 0, 0);
    return new Date(reminder.fecha).getTime() < today ? 'Vencido' : 'Próximo';
  }
  overdue() { return this.reminders().filter((reminder) => this.status(reminder) === 'Vencido'); }
  upcoming() { return this.reminders().filter((reminder) => this.status(reminder) === 'Próximo'); }
  completed() { return this.reminders().filter((reminder) => reminder.completado); }
  sortedReminders() {
    return [...this.reminders()].sort((a, b) => Number(a.completado) - Number(b.completado) || new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }
}
