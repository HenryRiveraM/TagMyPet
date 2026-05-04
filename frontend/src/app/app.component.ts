import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
      <nav class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <a routerLink="/" class="flex min-w-0 items-center gap-3 text-xl font-bold text-brand">
          <img class="h-12 w-12 shrink-0 object-contain md:h-14 md:w-14" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
          <span class="tracking-tight">TagMyPet</span>
        </a>
        <div class="flex max-w-full flex-wrap items-center gap-2 text-sm">
          @if (auth.user()) {
            <a routerLink="/perdidos" class="btn-outline">Perdidos</a>
            <a routerLink="/adopciones" class="btn-outline">Adopciones</a>
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
    <main class="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <router-outlet />
    </main>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
