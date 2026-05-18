import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Pet, User } from '../../core/models/domain';

@Component({
  standalone: true,
  template: `
    @if (pet(); as profile) {
      <section class="mx-auto max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="relative">
          <div class="flex max-h-[560px] min-h-[320px] w-full items-center justify-center bg-stone-100">
            <img class="max-h-[560px] w-full object-contain" [src]="profile.foto || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80'" [alt]="profile.nombre">
          </div>
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-6 text-white">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p class="text-sm font-semibold uppercase tracking-wide text-stone-200">Perfil NFC TagMyPet</p>
                <h1 class="mt-1 text-5xl font-bold">{{ profile.nombre }}</h1>
              </div>
              <span class="rounded-md px-3 py-1 text-sm font-semibold" [class.bg-red-500]="profile.estado === 'LOST'" [class.bg-brand]="profile.estado !== 'LOST'">{{ statusLabel(profile.estado) }}</span>
            </div>
          </div>
        </div>
        <div class="p-5 md:p-6">
          @if (profile.estado === 'LOST') {
            <div class="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              <h2 class="font-semibold">Mascota reportada como perdida</h2>
              <p class="mt-1 text-sm">Si la encontraste, contacta a su familia cuanto antes.</p>
            </div>
          }

          <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ profile.especie }} · {{ profile.raza || 'Sin raza' }}</p>
              <p class="text-sm text-slate-600">Color: {{ profile.color || 'No especificado' }}</p>
              <p class="mt-2 text-sm text-slate-500">Ciudad: {{ profile.contacto.ciudad || 'No especificada' }}</p>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row md:flex-col">
              <a class="btn" [href]="'tel:' + profile.contacto.telefono">Llamar al dueño</a>
              <a class="btn-outline" target="_blank" [href]="whatsapp(profile)">WhatsApp</a>
            </div>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Alergias</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ list(profile.alergias) }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Medicación</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ list(profile.medicacion) }}</p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Condiciones</p>
              <p class="mt-2 text-sm font-medium text-slate-900">{{ list(profile.enfermedades) }}</p>
            </div>
          </div>

          <div class="mt-6 rounded-lg border border-stone-200 bg-stone-100 p-4">
            <p class="text-sm text-stone-800">Este perfil muestra solo información crítica para identificación y emergencia. Los datos médicos completos requieren autorización del propietario.</p>
          </div>
        </div>
      </section>
    } @else {
      <p class="panel">Perfil no encontrado.</p>
    }
  `
})
export class NfcProfileComponent implements OnInit {
  pet = signal<(Partial<Pet> & { contacto: User }) | null>(null);
  constructor(private route: ActivatedRoute, private api: ApiService) {}
  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('nfcCode') || '';
    this.api.publicPet(code).subscribe({ next: (pet) => this.pet.set(pet), error: () => this.pet.set(null) });
  }
  list(values?: string[]) { return values?.length ? values.join(', ') : 'Sin datos críticos'; }
  statusLabel(status?: string) {
    const labels: Record<string, string> = { LOST: 'Perdida', ACTIVE: 'Activa', ADOPTION: 'En adopción', INACTIVE: 'Inactiva' };
    return labels[status || ''] || status || 'Activa';
  }
  whatsapp(profile: Partial<Pet> & { contacto: User }) {
    const phone = String(profile.contacto.telefono || '').replace(/[^\d+]/g, '');
    const text = encodeURIComponent(`Hola, encontré o quiero consultar por ${profile.nombre} desde su perfil NFC TagMyPet.`);
    return `https://wa.me/${phone.replace('+', '')}?text=${text}`;
  }
}
