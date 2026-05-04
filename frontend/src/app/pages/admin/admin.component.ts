import { Component, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/domain';

@Component({
  standalone: true,
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold">Panel admin</h1>
      <p class="text-slate-600">Gestión, moderación y métricas.</p>
    </section>
    <section class="mb-6 grid gap-4 md:grid-cols-5">
      @for (item of statItems(); track item.label) {
        <article class="panel">
          <p class="text-sm text-slate-500">{{ item.label }}</p>
          <p class="mt-2 text-3xl font-bold text-brand">{{ item.value }}</p>
        </article>
      }
    </section>
    <section class="panel overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead><tr class="border-b"><th class="py-2">Usuario</th><th>Email</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          @for (user of users(); track user._id || user.id) {
            <tr class="border-b last:border-0">
              <td class="py-3">{{ user.nombre }} {{ user.apellido }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.rol }}</td>
              <td>{{ user.estado }}</td>
              <td><button class="btn-outline" (click)="toggle(user)">Suspender/Activar</button></td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `
})
export class AdminComponent implements OnInit {
  stats = signal<Record<string, number>>({});
  users = signal<User[]>([]);
  constructor(private api: ApiService) {}
  ngOnInit() { this.load(); }
  statItems() {
    const s = this.stats();
    return [
      { label: 'Usuarios', value: s['users'] || 0 },
      { label: 'Mascotas', value: s['pets'] || 0 },
      { label: 'Perdidos', value: s['lost'] || 0 },
      { label: 'Adopciones', value: s['adoptions'] || 0 },
      { label: 'Premium', value: s['premium'] || 0 },
      { label: 'Clínicas', value: s['clinics'] || 0 },
      { label: 'Tags NFC', value: s['tags'] || 0 }
    ];
  }
  load() { this.api.adminStats().subscribe((s) => this.stats.set(s)); this.api.users().subscribe((u) => this.users.set(u)); }
  toggle(user: User) {
    const id = user._id || user.id;
    if (!id) return;
    this.api.updateUserStatus(id, user.estado === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE').subscribe(() => this.load());
  }
}
