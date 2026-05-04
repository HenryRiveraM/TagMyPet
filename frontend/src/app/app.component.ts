import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <a routerLink="/" class="flex items-center gap-2 text-xl font-bold text-brand">
          <img class="h-9 w-9 rounded-md border border-slate-200 bg-white object-contain" src="/assets/tagmypet-logo.svg" alt="TagMyPet logo">
          <span>TagMyPet</span>
        </a>
        <div class="flex flex-wrap items-center gap-2 text-sm">
          <a routerLink="/perdidos" class="btn-outline">Perdidos</a>
          <a routerLink="/adopciones" class="btn-outline">Adopciones</a>
          @if (auth.user()) {
            <a routerLink="/dashboard" class="btn-outline">Dashboard</a>
            <a routerLink="/clinicas" class="btn-outline">Clínicas</a>
            @if (auth.user()?.rol === 'ADMIN' || auth.user()?.rol === 'OWNER') {
              <a routerLink="/tags-nfc" class="btn-outline">NFC</a>
            }
            <button class="btn" (click)="auth.logout()">Salir</button>
          } @else {
            <a routerLink="/login" class="btn-outline">Login</a>
            <a routerLink="/register" class="btn">Registro</a>
          }
        </div>
      </nav>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8">
      <router-outlet />
    </main>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
