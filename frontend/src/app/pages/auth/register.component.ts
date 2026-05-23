import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-xl shadow-stone-200/80 lg:grid-cols-[0.9fr_1.1fr]">
      <div class="relative hidden min-h-[720px] overflow-hidden bg-[url('https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center lg:block">
        <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
        <div class="relative flex h-full items-end p-10 text-white">
          <div>
            <img class="mb-8 h-24 w-24 object-contain invert" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
            <p class="eyebrow text-stone-200">Una cuenta, todo el cuidado</p>
            <h2 class="mt-3 max-w-md text-4xl font-bold leading-tight">Gestiona salud, NFC y adopciones desde un solo lugar.</h2>
            <div class="mt-8 grid grid-cols-3 gap-3">
              @for (item of benefits; track item.value) {
                <div class="rounded-lg border border-white/20 bg-white/15 p-4 backdrop-blur">
                  <p class="text-2xl font-bold">{{ item.value }}</p>
                  <p class="mt-1 text-xs font-semibold text-stone-200">{{ item.label }}</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      <div class="p-5 sm:p-8 lg:p-10">
        <div class="mb-8 flex items-center gap-4 lg:hidden">
          <img class="h-20 w-20 object-contain" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
          <div>
            <p class="eyebrow">TagMyPet</p>
            <h1 class="mt-1 text-3xl font-bold tracking-tight">Registro</h1>
          </div>
        </div>
        <div class="hidden lg:block">
          <p class="eyebrow">Crear cuenta</p>
          <h1 class="mt-2 text-4xl font-bold tracking-tight text-slate-950">Registro</h1>
          <p class="mt-3 max-w-xl text-sm leading-6 text-slate-600">Completa tus datos para acceder al panel y comenzar a gestionar mascotas, historiales y perfiles NFC.</p>
        </div>
        <form class="mt-8 grid min-w-0 gap-4 sm:grid-cols-2" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Nombre *</span>
            <input class="field" formControlName="nombre" placeholder="Henry" autocomplete="given-name">
          </label>
          <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Apellido *</span>
            <input class="field" formControlName="apellido" placeholder="Rivera" autocomplete="family-name">
          </label>
          <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Email *</span>
            <input class="field" formControlName="email" placeholder="tu@email.com" type="email" autocomplete="email">
          </label>
          <label class="block min-w-0">
	            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Teléfono *</span>
            <input class="field" formControlName="telefono" placeholder="+591..." type="tel" autocomplete="tel">
          </label>
          <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Ciudad</span>
            <input class="field" formControlName="ciudad" placeholder="La Paz" autocomplete="address-level2">
          </label>
          <label class="block min-w-0">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Rol *</span>
            <select class="field" formControlName="rol">
              <option value="OWNER">Dueño</option>
              <option value="VETERINARIO">Veterinario</option>
            </select>
          </label>
          <label class="block min-w-0 sm:col-span-2">
            <span class="mb-1.5 block text-sm font-semibold text-slate-700">Password *</span>
            <div class="relative">
              <input class="field pr-24" formControlName="password" placeholder="Mínimo 8 caracteres" [type]="showPassword() ? 'text' : 'password'" autocomplete="new-password">
              <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-3 py-1.5 text-xs font-bold text-brand transition hover:bg-stone-100" (click)="showPassword.set(!showPassword())">
                {{ showPassword() ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </label>
          @if (error()) { <p class="rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 sm:col-span-2">{{ error() }}</p> }
          <button class="btn sm:col-span-2" [disabled]="form.invalid || loading()">{{ loading() ? 'Creando cuenta...' : 'Crear cuenta' }}</button>
        </form>
        <a routerLink="/login" class="mt-6 inline-flex text-sm font-semibold text-brand hover:text-neutral-700">Ya tengo cuenta</a>
      </div>
    </section>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = signal('');
  loading = signal(false);
  showPassword = signal(false);
  benefits = [
    { value: 'NFC', label: 'identidad' },
    { value: '24/7', label: 'acceso' },
    { value: 'Seguro', label: 'privacidad' }
  ];
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
	    telefono: ['', Validators.required],
    ciudad: [''],
    rol: ['OWNER' as const],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo registrar');
        this.loading.set(false);
      }
    });
  }
}
