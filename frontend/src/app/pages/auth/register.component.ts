import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-2xl panel">
      <h1 class="text-2xl font-bold">Registro</h1>
      <form class="mt-6 grid gap-4 md:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">
        <input class="field" formControlName="nombre" placeholder="Nombre">
        <input class="field" formControlName="apellido" placeholder="Apellido">
        <input class="field" formControlName="email" placeholder="Email" type="email">
        <input class="field" formControlName="telefono" placeholder="Teléfono">
        <input class="field" formControlName="ciudad" placeholder="Ciudad">
        <select class="field" formControlName="rol">
          <option value="OWNER">Dueño</option>
          <option value="VETERINARIO">Veterinario</option>
          <option value="ADOPTANTE">Adoptante</option>
        </select>
        <input class="field md:col-span-2" formControlName="password" placeholder="Password" type="password">
        @if (error()) { <p class="text-sm text-red-600 md:col-span-2">{{ error() }}</p> }
        <button class="btn md:col-span-2" [disabled]="form.invalid">Crear cuenta</button>
      </form>
      <a routerLink="/login" class="mt-4 block text-sm text-brand">Ya tengo cuenta</a>
    </section>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    ciudad: [''],
    rol: ['OWNER' as const],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) return;
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => this.error.set(err.error?.message || 'No se pudo registrar')
    });
  }
}
