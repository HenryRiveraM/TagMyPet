import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-md panel">
      <h1 class="text-2xl font-bold">Ingresar</h1>
      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <input class="field" formControlName="email" placeholder="Email" type="email">
        <input class="field" formControlName="password" placeholder="Password" type="password">
        @if (error()) { <p class="text-sm text-red-600">{{ error() }}</p> }
        <button class="btn w-full" [disabled]="form.invalid">Entrar</button>
      </form>
      <a routerLink="/register" class="mt-4 block text-sm text-brand">Crear una cuenta</a>
      <a routerLink="/forgot-password" class="mt-2 block text-sm text-brand">Olvidé mi password</a>
    </section>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');
  form = this.fb.nonNullable.group({
    email: ['admin@tagmypet.com', [Validators.required, Validators.email]],
    password: ['Password123', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => this.error.set(err.error?.message || 'No se pudo ingresar')
    });
  }
}
