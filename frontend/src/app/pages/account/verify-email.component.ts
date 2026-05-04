import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="mx-auto max-w-md panel">
      <h1 class="text-2xl font-bold">Verificación de email</h1>
      <p class="mt-3 text-slate-600">{{ message() }}</p>
      <a routerLink="/login" class="btn mt-6">Ir al login</a>
    </section>
  `
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  message = signal('Verificando...');
  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token') || '';
    this.auth.verifyEmail(token).subscribe({
      next: (res) => this.message.set(res.message),
      error: (err) => this.message.set(err.error?.message || 'No se pudo verificar')
    });
  }
}
