import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-md panel">
      <h1 class="text-2xl font-bold">Recuperar password</h1>
      <p class="mt-2 text-sm text-slate-600">Te enviaremos un enlace para crear un nuevo password.</p>
      <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <input class="field" formControlName="email" placeholder="Email *" type="email">
        @if (message()) { <p class="text-sm text-brand">{{ message() }}</p> }
        <button class="btn w-full" [disabled]="form.invalid">Enviar enlace</button>
      </form>
      <a routerLink="/login" class="mt-4 block text-sm text-brand">Volver al login</a>
    </section>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  message = signal('');
  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  submit() {
    this.auth.forgotPassword(this.form.controls.email.value).subscribe((res) => this.message.set(res.message));
  }
}
