import { Component, effect, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { ToastService } from './core/services/toast.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <header class="sticky top-0 z-30 border-b border-white/70 bg-white/90 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
      <nav class="mx-auto max-w-7xl px-4 py-3">
        <div class="flex items-center justify-between gap-3">
        <a [routerLink]="auth.user() ? '/dashboard' : '/'" (click)="menuOpen.set(false)" class="flex min-w-0 items-center gap-2 text-xl font-bold text-slate-950">
          <img class="h-12 w-12 shrink-0 object-contain md:h-14 md:w-14" src="/assets/tagmypet-logo.png" alt="TagMyPet logo">
          <span class="tracking-tight">TagMyPet</span>
        </a>
        <div class="flex items-center gap-2">
          @if (auth.user()) {
            <a routerLink="/notificaciones" class="relative flex h-11 w-11 items-center justify-center rounded-md border border-stone-200 bg-white text-slate-700 transition hover:border-slate-900" aria-label="Notificaciones">
              <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              @if (notifications.unread()) { <span class="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-slate-950 px-1 text-center text-[10px] font-bold leading-4 text-white">{{ notifications.unread() > 9 ? '9+' : notifications.unread() }}</span> }
            </a>
            <button type="button" class="flex h-11 w-11 items-center justify-center rounded-md border border-stone-200 bg-white md:hidden" (click)="menuOpen.set(!menuOpen())" aria-label="Abrir menú">
              <span class="space-y-1"><span class="block h-0.5 w-5 bg-slate-900"></span><span class="block h-0.5 w-5 bg-slate-900"></span><span class="block h-0.5 w-5 bg-slate-900"></span></span>
            </button>
          } @else {
            <a routerLink="/login" class="btn-outline">Login</a>
            <a routerLink="/register" class="btn">Registro</a>
          }
        </div>
        </div>
        @if (auth.user()) {
        <div class="mt-3 grid gap-2 text-sm md:mt-0 md:flex md:flex-wrap md:justify-end" [class.hidden]="!menuOpen()">
            <a routerLink="/dashboard" (click)="menuOpen.set(false)" class="btn-outline">Dashboard</a>
            @if (can(['ADMIN', 'OWNER', 'VETERINARIO'])) { <a routerLink="/mascotas" (click)="menuOpen.set(false)" class="btn-outline">Mis mascotas</a> }
            <a routerLink="/perdidos" (click)="menuOpen.set(false)" class="btn-outline">Perdidos</a>
            @if (can(['ADMIN', 'OWNER'])) { <a routerLink="/adopciones" (click)="menuOpen.set(false)" class="btn-outline">Adopciones</a> }
            @if (can(['ADMIN', 'OWNER', 'VETERINARIO'])) { <a routerLink="/historial" (click)="menuOpen.set(false)" class="btn-outline">Historial</a> }
            @if (can(['ADMIN', 'OWNER'])) { <a routerLink="/recordatorios" (click)="menuOpen.set(false)" class="btn-outline">Recordatorios</a> }
            @if (can(['OWNER'])) { <a routerLink="/premium" (click)="menuOpen.set(false)" class="btn-outline">Premium</a> }
            @if (can(['ADMIN', 'OWNER', 'VETERINARIO'])) { <a routerLink="/clinicas" (click)="menuOpen.set(false)" class="btn-outline">Clínicas</a> }
            @if (can(['ADMIN'])) { <a routerLink="/admin" (click)="menuOpen.set(false)" class="btn-outline">Admin</a> }
            <a routerLink="/perfil" (click)="menuOpen.set(false)" class="btn-outline">Mi perfil</a>
            <button class="btn" (click)="logout()">Salir</button>
        </div>
        }
      </nav>
    </header>
    <main class="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:py-10">
      <router-outlet />
    </main>
    <footer class="mx-auto flex max-w-7xl flex-col gap-2 px-4 pb-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
      <span>TagMyPet · Cuidado digital para mascotas</span>
      <div class="flex gap-4">
        <a routerLink="/privacidad" class="font-semibold hover:text-brand">Privacidad</a>
        <a routerLink="/terminos" class="font-semibold hover:text-brand">Términos</a>
      </div>
    </footer>
    <div class="fixed bottom-4 right-4 z-[70] flex w-[min(92vw,360px)] flex-col gap-3">
      @for (item of toast.toasts(); track item.id) {
        <button type="button" class="rounded-lg border p-4 text-left text-sm font-semibold shadow-2xl backdrop-blur transition hover:-translate-y-0.5"
          [class.border-emerald-200]="item.type === 'success'"
          [class.bg-emerald-50]="item.type === 'success'"
          [class.text-emerald-900]="item.type === 'success'"
          [class.border-red-200]="item.type === 'error'"
          [class.bg-red-50]="item.type === 'error'"
          [class.text-red-900]="item.type === 'error'"
          [class.border-stone-200]="item.type === 'info'"
          [class.bg-white]="item.type === 'info'"
          [class.text-slate-900]="item.type === 'info'"
          (click)="toast.dismiss(item.id)">
          {{ item.message }}
        </button>
      }
    </div>
  `
})
export class AppComponent {
  menuOpen = signal(false);
  constructor(public auth: AuthService, public toast: ToastService, public notifications: NotificationService) {
    effect(() => {
      if (this.auth.user()) this.notifications.refresh();
      else this.notifications.unread.set(0);
    });
  }
  can(roles: string[]) {
    const role = this.auth.user()?.rol;
    return !!role && roles.includes(role);
  }
  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
