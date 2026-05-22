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
          <button type="button" class="flex max-h-[560px] min-h-[320px] w-full items-center justify-center bg-stone-100" (click)="openGallery(profile, 0)">
            <img class="max-h-[560px] w-full object-contain transition duration-300 hover:scale-[1.02]" [src]="mainPhoto(profile)" [alt]="profile.nombre">
          </button>
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
          <div class="mb-5 rounded-lg border border-brand/10 bg-stone-50 p-4">
            <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Información crítica</p>
            <div class="mt-3 grid gap-3 md:grid-cols-3">
              <div><p class="text-xs font-semibold text-slate-500">Alergias</p><p class="mt-1 text-sm font-bold text-slate-950">{{ list(profile.alergias) }}</p></div>
              <div><p class="text-xs font-semibold text-slate-500">Medicación</p><p class="mt-1 text-sm font-bold text-slate-950">{{ list(profile.medicacion) }}</p></div>
              <div><p class="text-xs font-semibold text-slate-500">Condiciones</p><p class="mt-1 text-sm font-bold text-slate-950">{{ list(profile.enfermedades) }}</p></div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ profile.especie }} · {{ profile.raza || 'Sin raza' }}</p>
              <p class="text-sm text-slate-600">Color: {{ profile.color || 'No especificado' }}</p>
              <p class="mt-2 text-sm text-slate-500">Ciudad: {{ profile.contacto.ciudad || 'No especificada' }}</p>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row md:flex-col">
              <a class="btn" [href]="'tel:' + profile.contacto.telefono">Llamar al dueño</a>
              <a class="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700" target="_blank" [href]="whatsapp(profile)">Contactar por WhatsApp</a>
            </div>
          </div>

          @if ((profile.fotos?.length || 0) > 1) {
            <div class="mt-6 grid grid-cols-5 gap-2">
              @for (photo of profile.fotos?.slice(0, 5); track photo; let i = $index) {
                <button type="button" class="overflow-hidden rounded-md bg-stone-100 ring-brand/20 transition hover:ring-4" (click)="openGallery(profile, i)">
                  <img class="aspect-square w-full object-contain" [src]="photo" [alt]="profile.nombre + ' foto ' + (i + 1)">
                </button>
              }
            </div>
            <button type="button" class="mt-3 text-sm font-semibold text-brand" (click)="openGallery(profile, 0)">Ver todas las fotos</button>
          } @else {
            <button type="button" class="mt-6 text-sm font-semibold text-brand" (click)="openGallery(profile, 0)">Ver foto completa</button>
          }

          <div class="mt-6 rounded-lg border border-stone-200 bg-stone-100 p-4">
            <p class="text-sm text-stone-800">Este perfil muestra solo información crítica para identificación y emergencia. Los datos médicos completos requieren autorización del propietario.</p>
          </div>
        </div>
      </section>
      @if (gallery(); as view) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" (click)="closeGallery()">
          <section class="relative w-full max-w-5xl rounded-lg bg-white p-4 shadow-2xl" (click)="$event.stopPropagation()">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <p class="text-xs font-bold uppercase tracking-widest text-slate-500">Galería</p>
                <h2 class="text-xl font-bold">{{ view.name }}</h2>
              </div>
              <button type="button" class="btn-outline" (click)="closeGallery()">Cerrar</button>
            </div>
            <div class="flex min-h-[320px] items-center justify-center rounded-lg bg-stone-100 md:min-h-[560px]">
              <img class="max-h-[72vh] w-full object-contain" [src]="view.photos[view.index]" [alt]="view.name">
            </div>
            @if (view.photos.length > 1) {
              <div class="mt-4 flex items-center justify-between gap-3">
                <button type="button" class="btn-outline" (click)="previousPhoto()">Anterior</button>
                <p class="text-sm font-semibold text-slate-600">{{ view.index + 1 }} / {{ view.photos.length }}</p>
                <button type="button" class="btn-outline" (click)="nextPhoto()">Siguiente</button>
              </div>
              <div class="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
                @for (photo of view.photos; track photo; let i = $index) {
                  <button type="button" class="overflow-hidden rounded-md bg-stone-100 ring-offset-2 transition" [class.ring-4]="i === view.index" [class.ring-brand]="i === view.index" (click)="setPhoto(i)">
                    <img class="aspect-square w-full object-contain" [src]="photo" [alt]="view.name + ' miniatura ' + (i + 1)">
                  </button>
                }
              </div>
            }
          </section>
        </div>
      }
    } @else {
      <p class="panel">Perfil no encontrado.</p>
    }
  `
})
export class NfcProfileComponent implements OnInit {
  pet = signal<(Partial<Pet> & { contacto: User }) | null>(null);
  gallery = signal<{ name: string; photos: string[]; index: number } | null>(null);
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
  mainPhoto(profile: Partial<Pet>) {
    return this.photos(profile)[0];
  }
  photos(profile: Partial<Pet>) {
    const images = profile.fotos?.length ? profile.fotos : profile.foto ? [profile.foto] : [];
    return images.length ? images : ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80'];
  }
  openGallery(profile: Partial<Pet>, index: number) {
    const photos = this.photos(profile);
    this.gallery.set({ name: profile.nombre || 'Mascota', photos, index: Math.min(index, photos.length - 1) });
  }
  closeGallery() { this.gallery.set(null); }
  setPhoto(index: number) {
    const view = this.gallery();
    if (!view) return;
    this.gallery.set({ ...view, index });
  }
  previousPhoto() {
    const view = this.gallery();
    if (!view) return;
    this.gallery.set({ ...view, index: (view.index - 1 + view.photos.length) % view.photos.length });
  }
  nextPhoto() {
    const view = this.gallery();
    if (!view) return;
    this.gallery.set({ ...view, index: (view.index + 1) % view.photos.length });
  }
}
