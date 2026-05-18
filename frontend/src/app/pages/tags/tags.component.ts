import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { NfcTag, Pet } from '../../core/models/domain';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="mb-6">
      <h1 class="text-3xl font-bold">Inventario NFC</h1>
      <p class="text-slate-600">Lotes físicos, estados del collar y asignación a mascotas.</p>
      @if (auth.user()?.rol === 'ADMIN') {
        <button class="btn-outline mt-4" (click)="exportCsv()">Exportar CSV</button>
      }
    </section>

    <div class="grid gap-6 lg:grid-cols-[360px_1fr]">
      @if (auth.user()?.rol === 'ADMIN') {
        <section class="panel">
          <h2 class="font-semibold">Crear lote</h2>
          <form class="mt-4 space-y-3" [formGroup]="batchForm" (ngSubmit)="createBatch()">
            <input class="field" formControlName="batch" placeholder="Lote">
            <input class="field" type="number" formControlName="quantity" placeholder="Cantidad">
            <button class="btn w-full" [disabled]="batchForm.invalid">Generar tags</button>
          </form>
          <form class="mt-6 space-y-3 border-t pt-4" [formGroup]="singleForm" (ngSubmit)="createSingle()">
            <input class="field" formControlName="code" placeholder="TMP-LUCAS-001">
            <input class="field" formControlName="batch" placeholder="Lote">
            <button class="btn-outline w-full">Crear tag manual</button>
          </form>
        </section>
      }

      <section class="panel">
        <h2 class="font-semibold">Asignar tag a mascota</h2>
        <p class="mt-1 text-sm text-slate-600">Usa esto para reemplazar códigos largos por un código NFC listo para grabar en el collar.</p>
        <form class="mt-4 grid gap-3 md:grid-cols-3" [formGroup]="assignForm" (ngSubmit)="assign()">
          <select class="field" formControlName="code">
            @for (tag of availableTags(); track tag._id) { <option [value]="tag.code">{{ tag.code }}</option> }
          </select>
          <select class="field" formControlName="pet">
            @for (pet of pets(); track pet._id) { <option [value]="pet._id">{{ pet.nombre }}</option> }
          </select>
          <button class="btn" [disabled]="assignForm.invalid || saving()">{{ saving() ? 'Asignando...' : 'Asignar' }}</button>
        </form>
        @if (message()) { <p class="mt-3 text-sm text-brand">{{ message() }}</p> }
      </section>
    </div>

    <section class="mt-6 grid gap-4 lg:grid-cols-3">
      <article class="panel">
        <span class="badge">1. Asignar</span>
        <h2 class="mt-4 text-lg font-semibold">Vincula collar y mascota</h2>
        <p class="mt-2 text-sm text-slate-600">Selecciona un tag disponible y una mascota. Al asignarlo, el código queda asociado al perfil público correcto.</p>
        <div class="mt-4 rounded-md bg-stone-100 p-3 text-sm">
          <p class="font-semibold text-slate-900">Tag seleccionado</p>
          <p class="mt-1 break-all text-slate-600">{{ assignForm.controls.code.value || 'Selecciona un tag' }}</p>
        </div>
      </article>

      <article class="panel">
        <span class="badge">2. Grabar</span>
        <h2 class="mt-4 text-lg font-semibold">Escribe el link en el NFC</h2>
        <p class="mt-2 text-sm text-slate-600">En Android con Chrome puedes grabar desde la web. En iPhone usa NFC Pulse copiando este enlace.</p>
        <div class="mt-4 rounded-md border border-stone-200 bg-white p-3">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">URL a grabar</p>
          <p class="mt-2 break-all text-sm font-semibold text-slate-900">{{ selectedPublicUrl() }}</p>
        </div>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <button class="btn-outline" type="button" (click)="copySelectedUrl()">Copiar para NFC Pulse</button>
          <button class="btn" type="button" [disabled]="!nfcSupported() || !assignForm.controls.code.value || writing()" (click)="writeSelectedTag()">
            {{ writing() ? 'Acerca el collar...' : 'Grabar en NFC' }}
          </button>
        </div>
        @if (!nfcSupported()) {
          <p class="mt-3 text-xs text-slate-500">La grabación web requiere Android + Chrome. En otros celulares usa el botón copiar y graba con NFC Pulse.</p>
        }
      </article>

      <article class="panel">
        <span class="badge">3. Verificar</span>
        <h2 class="mt-4 text-lg font-semibold">Confirma que abre bien</h2>
        <p class="mt-2 text-sm text-slate-600">Luego de grabar, lee el collar o abre el perfil esperado para revisar que la mascota correcta aparezca.</p>
        <div class="mt-4 grid gap-2 sm:grid-cols-2">
          <button class="btn-outline" type="button" [disabled]="!nfcSupported() || reading()" (click)="readTag()">
            {{ reading() ? 'Leyendo...' : 'Leer NFC' }}
          </button>
          <a class="btn" [href]="selectedPublicUrl()" target="_blank">Abrir perfil</a>
        </div>
        @if (readResult()) {
          <div class="mt-4 rounded-md border border-stone-200 bg-stone-100 p-3">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Lectura</p>
            <p class="mt-1 break-all text-sm font-semibold" [class.text-brand]="readMatches()" [class.text-red-700]="!readMatches()">{{ readResult() }}</p>
            <p class="mt-1 text-xs" [class.text-brand]="readMatches()" [class.text-red-700]="!readMatches()">{{ readMatches() ? 'Coincide con el tag seleccionado.' : 'No coincide con el tag seleccionado.' }}</p>
          </div>
        }
      </article>
    </section>

    <section class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      @for (tag of tags(); track tag._id) {
        <article class="panel">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold">{{ tag.code }}</h2>
              <p class="text-sm text-slate-600">{{ tag.batch || 'Sin lote' }}</p>
            </div>
            <span class="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-brand">{{ tag.status }}</span>
          </div>
          <p class="mt-3 text-sm text-slate-600">Mascota: {{ tag.pet?.nombre || 'Sin asignar' }}</p>
          @if (tag.publicUrl) {
            <a class="mt-3 block break-all text-sm font-semibold text-brand" [href]="hashedPublicUrl(tag)" target="_blank">{{ hashedPublicUrl(tag) }}</a>
          }
          @if (auth.user()?.rol === 'ADMIN') {
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="btn-outline" (click)="status(tag, 'AVAILABLE')">Disponible</button>
              <button class="btn-outline" (click)="status(tag, 'DEFECTIVE')">Defectuoso</button>
              <button class="btn-outline" (click)="status(tag, 'DISABLED')">Desactivar</button>
            </div>
          }
        </article>
      }
    </section>
  `
})
export class TagsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  auth = inject(AuthService);
  tags = signal<NfcTag[]>([]);
  pets = signal<Pet[]>([]);
  message = signal('');
  saving = signal(false);
  writing = signal(false);
  reading = signal(false);
  nfcSupported = signal(false);
  readResult = signal('');
  readMatches = signal(false);

  batchForm = this.fb.nonNullable.group({ batch: ['LOTE-2026'], quantity: [10, [Validators.required, Validators.min(1), Validators.max(200)]] });
  singleForm = this.fb.nonNullable.group({ code: [''], batch: ['LOTE-2026'] });
  assignForm = this.fb.nonNullable.group({ code: ['', Validators.required], pet: ['', Validators.required] });

  ngOnInit() {
    this.nfcSupported.set(typeof window !== 'undefined' && 'NDEFReader' in window);
    this.load();
  }
  availableTags() { return this.tags().filter((tag) => tag.status === 'AVAILABLE' || tag.status === 'SOLD'); }
  hashedPublicUrl(tag: NfcTag) {
    const origin = location.origin;
    return `${origin}/#/pet/public/${encodeURIComponent(tag.code)}`;
  }
  selectedPublicUrl() {
    const code = this.assignForm.controls.code.value || this.tags()[0]?.code || '';
    return code ? `${location.origin}/#/pet/public/${encodeURIComponent(code)}` : 'Selecciona o crea un tag primero';
  }
  copySelectedUrl() {
    const url = this.selectedPublicUrl();
    navigator.clipboard?.writeText(url);
    this.message.set('Link NFC copiado. Pégalo en NFC Pulse o grábalo desde Android Chrome.');
  }
  async writeSelectedTag() {
    if (!this.nfcSupported() || !this.assignForm.controls.code.value) return;
    this.writing.set(true);
    this.message.set('Acerca el collar NFC al celular para grabarlo.');
    try {
      const NDEFReaderCtor = (window as unknown as { NDEFReader: new () => { write: (message: unknown) => Promise<void> } }).NDEFReader;
      const writer = new NDEFReaderCtor();
      await writer.write({ records: [{ recordType: 'url', data: this.selectedPublicUrl() }] });
      this.message.set('Tag NFC grabado. Ahora verifica el collar.');
    } catch {
      this.message.set('No se pudo grabar. Usa NFC Pulse copiando el link.');
    } finally {
      this.writing.set(false);
    }
  }
  async readTag() {
    if (!this.nfcSupported()) return;
    this.reading.set(true);
    this.readResult.set('');
    this.message.set('Acerca el collar NFC para leerlo.');
    try {
      type NdefRecord = { recordType: string; data?: DataView };
      type NdefMessage = { records: NdefRecord[] };
      type NdefReadingEvent = { message: NdefMessage };
      const NDEFReaderCtor = (window as unknown as { NDEFReader: new () => EventTarget & { scan: () => Promise<void> } }).NDEFReader;
      const reader = new NDEFReaderCtor();
      await reader.scan();
      reader.addEventListener('reading', ((event: Event) => {
        const record = (event as unknown as NdefReadingEvent).message.records[0];
        const text = this.decodeNfcRecord(record);
        this.readResult.set(text || 'Tag leído sin URL visible');
        this.readMatches.set(Boolean(text && text.includes(this.assignForm.controls.code.value)));
        this.reading.set(false);
      }) as EventListener, { once: true });
    } catch {
      this.message.set('No se pudo leer desde la web. Abre el link o escanea con la app NFC.');
      this.reading.set(false);
    }
  }
  decodeNfcRecord(record: { recordType: string; data?: DataView }) {
    if (!record?.data) return '';
    const bytes = new Uint8Array(record.data.buffer);
    if (record.recordType === 'url') {
      const prefixes = ['', 'http://www.', 'https://www.', 'http://', 'https://'];
      const prefix = prefixes[bytes[0]] || '';
      return prefix + new TextDecoder().decode(bytes.slice(1));
    }
    return new TextDecoder().decode(bytes);
  }
  load() {
    this.api.tags().subscribe((tags) => {
      this.tags.set(tags);
      const first = this.availableTags()[0];
      if (first) this.assignForm.patchValue({ code: first.code });
    });
    this.api.pets().subscribe((pets) => {
      this.pets.set(pets);
      if (pets[0]) this.assignForm.patchValue({ pet: pets[0]._id });
    });
  }
  createBatch() { this.api.createTagBatch(this.batchForm.getRawValue()).subscribe(() => { this.message.set('Lote creado'); this.load(); }); }
  createSingle() { this.api.createTag(this.singleForm.getRawValue()).subscribe(() => { this.singleForm.reset({ batch: 'LOTE-2026', code: '' }); this.message.set('Tag creado'); this.load(); }); }
  assign() {
    if (this.assignForm.invalid || this.saving()) return;
    this.saving.set(true);
    const value = this.assignForm.getRawValue();
    this.api.assignTag(value.code, value.pet).subscribe({
      next: () => { this.message.set('Tag asignado. El perfil NFC público ya usa el nuevo código.'); this.saving.set(false); this.load(); },
      error: (err) => { this.message.set(err.error?.message || 'No se pudo asignar'); this.saving.set(false); }
    });
  }
  status(tag: NfcTag, status: string) { this.api.updateTagStatus(tag._id, status, tag.notes || '').subscribe(() => this.load()); }
  exportCsv() {
    this.api.exportTagsCsv().subscribe((response) => {
      const blob = response.body;
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'tagmypet-nfc-tags.csv';
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }
}
