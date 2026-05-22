import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }

  dismiss(id: number) {
    this.toasts.update((items) => items.filter((item) => item.id !== id));
  }

  private show(message: string, type: ToastType) {
    const id = ++this.counter;
    this.toasts.update((items) => [...items, { id, type, message }].slice(-4));
    window.setTimeout(() => this.dismiss(id), 4200);
  }
}
