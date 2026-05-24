import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Notification } from '../../core/models/domain';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [DatePipe, RouterLink],
  template: `
    <section class="mx-auto max-w-3xl">
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="eyebrow">Centro de actividad</p>
          <h1 class="mt-2 text-3xl font-bold">Notificaciones</h1>
          <p class="mt-2 text-slate-600">Clínicas, adopciones, alertas NFC, recordatorios y Premium en un solo lugar.</p>
        </div>
        @if (items().length) { <button class="btn-outline" (click)="readAll()">Marcar todo leído</button> }
      </div>
      @if (loading()) {
        <div class="space-y-3">@for (item of [1,2,3]; track item) { <div class="panel h-24 animate-pulse bg-stone-50"></div> }</div>
      } @else if (!items().length) {
        <article class="panel py-14 text-center">
          <h2 class="text-xl font-bold">Todo tranquilo por ahora</h2>
          <p class="mt-2 text-sm text-slate-600">Aquí aparecerán aprobaciones, escaneos NFC y recordatorios próximos.</p>
          <a routerLink="/dashboard" class="btn mt-6">Volver al dashboard</a>
        </article>
      } @else {
        <div class="space-y-3">
          @for (item of items(); track item._id) {
            <button type="button" class="panel flex w-full items-start gap-4 text-left transition hover:border-slate-400" [class.bg-stone-50]="item.readAt" (click)="open(item)">
              <span class="mt-1 h-3 w-3 shrink-0 rounded-full" [class.bg-slate-950]="!item.readAt" [class.bg-stone-300]="item.readAt"></span>
              <span class="min-w-0 flex-1">
                <span class="flex flex-col justify-between gap-1 sm:flex-row">
                  <strong>{{ item.title }}</strong><time class="text-xs text-slate-500">{{ item.createdAt | date:'medium' }}</time>
                </span>
                <span class="mt-2 block text-sm text-slate-600">{{ item.message }}</span>
              </span>
            </button>
          }
        </div>
      }
    </section>
  `
})
export class NotificationsComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private badge = inject(NotificationService);
  private toast = inject(ToastService);
  items = signal<Notification[]>([]);
  loading = signal(true);

  ngOnInit() { this.load(); }
  load() {
    this.api.notifications().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); this.badge.refresh(); },
      error: () => { this.loading.set(false); this.toast.error('No se pudieron cargar las notificaciones'); }
    });
  }
  open(item: Notification) {
    this.api.readNotification(item._id).subscribe({
      next: () => { this.badge.refresh(); if (item.link) this.router.navigateByUrl(item.link); else this.load(); },
      error: () => undefined
    });
  }
  readAll() {
    this.api.readAllNotifications().subscribe({ next: () => { this.toast.success('Notificaciones leídas'); this.load(); } });
  }
}
