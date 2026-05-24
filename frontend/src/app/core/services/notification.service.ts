import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  unread = signal(0);

  constructor(private api: ApiService) {}

  refresh() {
    this.api.unreadNotificationCount().subscribe({
      next: ({ count }) => this.unread.set(count),
      error: () => this.unread.set(0)
    });
  }
}
