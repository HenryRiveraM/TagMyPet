import { DOCUMENT } from '@angular/common';
import { Component, EventEmitter, HostListener, Inject, Input, OnChanges, OnDestroy, Output, signal } from '@angular/core';

export interface PhotoGalleryView {
  name: string;
  photos: string[];
  index: number;
}

@Component({
  selector: 'app-photo-viewer',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-[100] flex flex-col bg-zinc-950/95 text-white backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="'Galeria de fotos de ' + view.name"
      (click)="dismissed.emit()"
    >
      <header class="relative z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">Fotos</p>
          <p class="truncate text-sm font-semibold text-white sm:text-base">{{ view.name }}</p>
        </div>
        <div class="flex items-center gap-3">
          <p class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">{{ selected() + 1 }} / {{ view.photos.length }}</p>
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-2xl leading-none text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60"
            aria-label="Cerrar galeria"
            (click)="dismissed.emit(); $event.stopPropagation()"
          >&times;</button>
        </div>
      </header>

      <main
        class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-3 sm:px-16 sm:py-5"
        (click)="$event.stopPropagation()"
        (touchstart)="touchStart($event)"
        (touchend)="touchEnd($event)"
      >
        @if (!loaded()) {
          <div class="absolute inset-0 flex items-center justify-center" aria-label="Cargando foto">
            <span class="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white"></span>
          </div>
        }
        <img
          class="max-h-full max-w-full select-none object-contain shadow-2xl shadow-black/40 transition-opacity duration-300"
          [class.opacity-0]="!loaded()"
          [class.opacity-100]="loaded()"
          [src]="view.photos[selected()]"
          [alt]="view.name + ', foto ' + (selected() + 1)"
          draggable="false"
          (load)="loaded.set(true)"
        >
        @if (view.photos.length > 1) {
          <button
            type="button"
            class="absolute left-3 hidden h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/30 text-4xl font-light text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 sm:flex"
            aria-label="Foto anterior"
            (click)="previous()"
          >&lsaquo;</button>
          <button
            type="button"
            class="absolute right-3 hidden h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/30 text-4xl font-light text-white backdrop-blur transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/60 sm:flex"
            aria-label="Foto siguiente"
            (click)="next()"
          >&rsaquo;</button>
        }
      </main>

      <footer class="shrink-0 border-t border-white/10 bg-black/20 p-3 sm:px-6 sm:py-4" (click)="$event.stopPropagation()">
        @if (view.photos.length > 1) {
          <div class="mb-3 flex justify-center gap-3 sm:hidden">
            <button type="button" class="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold transition active:bg-white/15" (click)="previous()">Anterior</button>
            <button type="button" class="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold transition active:bg-white/15" (click)="next()">Siguiente</button>
          </div>
          <div class="mx-auto flex max-w-3xl justify-center gap-2 overflow-x-auto py-1">
            @for (photo of view.photos; track photo; let i = $index) {
              <button
                type="button"
                class="h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 bg-zinc-900 transition sm:h-16 sm:w-16"
                [class.border-white]="i === selected()"
                [class.opacity-100]="i === selected()"
                [class.border-transparent]="i !== selected()"
                [class.opacity-60]="i !== selected()"
                [attr.aria-label]="'Mostrar foto ' + (i + 1)"
                (click)="choose(i)"
              >
                <img class="h-full w-full object-cover" [src]="photo" [alt]="''">
              </button>
            }
          </div>
        } @else {
          <p class="text-center text-xs font-medium text-zinc-400">Imagen completa</p>
        }
      </footer>
    </div>
  `
})
export class PhotoViewerComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) view!: PhotoGalleryView;
  @Output() dismissed = new EventEmitter<void>();
  selected = signal(0);
  loaded = signal(false);
  private startX: number | null = null;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.document.body.style.overflow = 'hidden';
  }

  ngOnChanges() {
    this.selected.set(Math.min(Math.max(this.view?.index ?? 0, 0), Math.max((this.view?.photos.length ?? 1) - 1, 0)));
    this.loaded.set(false);
  }

  ngOnDestroy() {
    this.document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  closeWithKeyboard() {
    this.dismissed.emit();
  }

  @HostListener('document:keydown.arrowleft')
  previousWithKeyboard() {
    this.previous();
  }

  @HostListener('document:keydown.arrowright')
  nextWithKeyboard() {
    this.next();
  }

  choose(index: number) {
    if (index === this.selected()) return;
    this.loaded.set(false);
    this.selected.set(index);
  }

  previous() {
    if (this.view.photos.length < 2) return;
    this.choose((this.selected() - 1 + this.view.photos.length) % this.view.photos.length);
  }

  next() {
    if (this.view.photos.length < 2) return;
    this.choose((this.selected() + 1) % this.view.photos.length);
  }

  touchStart(event: TouchEvent) {
    this.startX = event.changedTouches[0]?.clientX ?? null;
  }

  touchEnd(event: TouchEvent) {
    if (this.startX === null) return;
    const movement = (event.changedTouches[0]?.clientX ?? this.startX) - this.startX;
    this.startX = null;
    if (Math.abs(movement) < 45) return;
    movement > 0 ? this.previous() : this.next();
  }
}
