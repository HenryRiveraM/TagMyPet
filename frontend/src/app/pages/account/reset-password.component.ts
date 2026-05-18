import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-md panel">
      <h1 class="text-2xl font-bold">Nuevo password</h1>
      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <input class="field" formControlName="password" placeholder="Password nuevo *" type="password">
        @if (message()) { <p class="text-sm text-red-600">{{ message() }}</p> }
        <button class="btn w-full" [disabled]="form.invalid">Guardar password</button>
      </form>
      <a routerLink="/login" class="mt-4 block text-sm text-brand">Volver al login</a>
    </section>
  `
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  message = signal('');
  form = this.fb.nonNullable.group({ password: ['', [Validators.required, Validators.minLength(8)]] });
  submit() {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    this.auth.resetPassword(token, this.form.controls.password.value).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => this.message.set(err.error?.message || 'No se pudo restablecer')
    });
  }
}
