import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="sticky top-0 z-30 border-b border-white/70 bg-white/85 shadow-sm shadow-slate-200/60 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30">
      <nav class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <a [routerLink]="auth.user() ? '/dashboard' : '/'" class="flex min-w-0 items-center gap-3 text-xl font-bold text-brand dark:text-white">
          <img class="h-12 w-12 shrink-0 object-contain md:h-14 md:w-14" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
          <span class="tracking-tight">TagMyPet</span>
        </a>
        <div class="flex max-w-full flex-wrap items-center gap-2 text-sm">
          @if (auth.user()) {
            @if (can(['ADMIN', 'OWNER', 'VETERINARIO'])) { <a routerLink="/mascotas" class="btn-outline">Mis mascotas</a> }
            <a routerLink="/perdidos" class="btn-outline">Perdidos</a>
            <a routerLink="/dashboard" class="btn-outline">Dashboard</a>
            @if (can(['ADMIN', 'OWNER', 'VETERINARIO'])) { <a routerLink="/historial" class="btn-outline">Historial</a> }
            @if (can(['ADMIN', 'OWNER'])) { <a routerLink="/recordatorios" class="btn-outline">Recordatorios</a> }
            @if (can(['ADMIN', 'OWNER', 'VETERINARIO'])) { <a routerLink="/clinicas" class="btn-outline">Clínicas</a> }
            @if (can(['ADMIN'])) { <a routerLink="/admin" class="btn-outline">Admin</a> }
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
  can(roles: string[]) {
    const role = this.auth.user()?.rol;
    return !!role && roles.includes(role);
  }
}
