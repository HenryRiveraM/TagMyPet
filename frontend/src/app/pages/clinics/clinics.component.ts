import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Clinic, Pet, PetAccessRequest } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold">Clínicas veterinarias</h1>
      <p class="text-slate-600">Gestiona veterinarias asociadas y permisos médicos por mascota.</p>
    </section>

    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      @if (auth.user()?.rol === 'ADMIN' || auth.user()?.rol === 'VETERINARIO') {
        <section class="panel">
          <h2 class="font-semibold">Registrar clínica</h2>
          <form class="mt-4 space-y-3" [formGroup]="clinicForm" (ngSubmit)="createClinic()">
            <input class="field" formControlName="nombre" placeholder="Nombre de clínica">
            <input class="field" formControlName="nit" placeholder="NIT opcional">
            <input class="field" formControlName="telefono" placeholder="Teléfono">
            <input class="field" formControlName="email" placeholder="Email">
            <input class="field" formControlName="ciudad" placeholder="Ciudad">
            <input class="field" formControlName="direccion" placeholder="Dirección">
            <button class="btn w-full" [disabled]="clinicForm.invalid">Guardar clínica</button>
          </form>
        </section>
      }

      @if (auth.user()?.rol === 'VETERINARIO') {
        <section class="panel">
          <h2 class="font-semibold">Solicitar acceso médico</h2>
          <form class="mt-4 grid gap-3 md:grid-cols-3" [formGroup]="accessForm" (ngSubmit)="requestAccess()">
            <input class="field" formControlName="nfcCode" placeholder="Código NFC de la mascota">
            <select class="field" formControlName="clinic">
              <option value="">Sin clínica</option>
              @for (clinic of clinics(); track clinic._id) { <option [value]="clinic._id">{{ clinic.nombre }}</option> }
            </select>
            <button class="btn" [disabled]="accessForm.invalid">Solicitar</button>
          </form>
        </section>
      }
    </div>

    <section class="mt-6 grid gap-4 md:grid-cols-2">
      @for (clinic of clinics(); track clinic._id) {
        <article class="panel">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-xl font-semibold">{{ clinic.nombre }}</h2>
              <p class="text-sm text-slate-600">{{ clinic.ciudad }} · {{ clinic.direccion }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ clinic.telefono }} · {{ clinic.email || 'Sin email' }}</p>
            </div>
            <span class="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-brand">{{ clinic.estado }}</span>
          </div>
          @if (auth.user()?.rol === 'ADMIN' || auth.user()?.rol === 'VETERINARIO') {
            <form class="mt-4 flex gap-2" [formGroup]="vetForm" (ngSubmit)="addVet(clinic._id)">
              <input class="field" formControlName="email" placeholder="Email veterinario">
              <button class="btn-outline">Agregar</button>
            </form>
          }
          <p class="mt-3 text-xs text-slate-500">Veterinarios: {{ clinic.veterinarios?.length || 0 }}</p>
        </article>
      }
    </section>

    <section class="mt-6 panel">
      <h2 class="font-semibold">Solicitudes de acceso</h2>
      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead><tr class="border-b"><th class="py-2">Mascota</th><th>Veterinario</th><th>Clínica</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            @for (request of requests(); track request._id) {
              <tr class="border-b last:border-0">
                <td class="py-3">{{ request.pet.nombre }}</td>
                <td>{{ request.veterinarian.nombre }} {{ request.veterinarian.apellido }}</td>
                <td>{{ request.clinic?.nombre || 'Sin clínica' }}</td>
                <td>{{ request.status }}</td>
                <td class="flex gap-2 py-2">
                  @if ((auth.user()?.rol === 'OWNER' || auth.user()?.rol === 'ADMIN') && request.status === 'PENDING') {
                    <button class="btn-outline" (click)="decide(request._id, 'APPROVED')">Aprobar</button>
                    <button class="btn-outline" (click)="decide(request._id, 'REJECTED')">Rechazar</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `
})
export class ClinicsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  auth = inject(AuthService);
  clinics = signal<Clinic[]>([]);
  requests = signal<PetAccessRequest[]>([]);

  clinicForm = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    nit: [''],
    telefono: ['', Validators.required],
    email: [''],
    ciudad: ['', Validators.required],
    direccion: ['', Validators.required]
  });
  vetForm = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  accessForm = this.fb.nonNullable.group({ nfcCode: ['', Validators.required], clinic: [''] });

  ngOnInit() { this.load(); }
  load() {
    this.api.clinics().subscribe((clinics) => this.clinics.set(clinics));
    this.api.accessRequests().subscribe((requests) => this.requests.set(requests));
  }
  createClinic() { this.api.createClinic(this.clinicForm.getRawValue()).subscribe(() => { this.clinicForm.reset(); this.load(); }); }
  addVet(clinicId: string) { this.api.addVeterinarian(clinicId, this.vetForm.controls.email.value).subscribe(() => { this.vetForm.reset(); this.load(); }); }
  requestAccess() { this.api.requestPetAccess(this.accessForm.getRawValue()).subscribe(() => this.load()); }
  decide(id: string, status: 'APPROVED' | 'REJECTED' | 'REVOKED') { this.api.decidePetAccess(id, status).subscribe(() => this.load()); }
}
