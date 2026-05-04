import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-xl shadow-slate-200/80 md:grid-cols-[0.92fr_1.08fr]">
      <div class="hidden bg-[url('https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1100&q=80')] bg-cover bg-center md:block">
        <div class="flex h-full min-h-[560px] items-end bg-slate-950/35 p-8">
          <div class="text-white">
            <p class="eyebrow text-stone-200">TagMyPet</p>
            <h2 class="mt-3 text-4xl font-bold leading-tight">Cuidado digital para cada mascota.</h2>
          </div>
        </div>
      </div>
      <div class="p-6 sm:p-10">
        <img class="mb-8 h-14 w-14 rounded-lg border border-slate-200 bg-white object-contain p-1 shadow-sm" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
        <p class="eyebrow">Acceso seguro</p>
        <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Iniciar sesión</h1>
        <form class="mt-8 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
            <input class="field" formControlName="email" placeholder="tu@email.com" type="email" autocomplete="email">
          </label>
          <label class="block">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
            <div class="relative">
              <input class="field pr-24" formControlName="password" placeholder="Tu password" [type]="showPassword() ? 'text' : 'password'" autocomplete="current-password">
              <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-stone-100" (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </label>
          @if (error()) { <p class="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{{ error() }}</p> }
          <button class="btn w-full" [disabled]="form.invalid || loading()">{{ loading() ? 'Ingresando...' : 'Iniciar sesión' }}</button>
        </form>
        <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
          <a routerLink="/register" class="text-brand hover:text-neutral-700">Crear una cuenta</a>
          <a routerLink="/forgot-password" class="text-brand hover:text-neutral-700">Olvidé mi password</a>
        </div>
      </div>
    </section>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo ingresar');
        this.loading.set(false);
      }
    });
  }
}
