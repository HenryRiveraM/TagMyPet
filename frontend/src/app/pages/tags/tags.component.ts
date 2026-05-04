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

    <section class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      @for (tag of tags(); track tag._id) {
        <article class="panel">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-semibold">{{ tag.code }}</h2>
              <p class="text-sm text-slate-600">{{ tag.batch || 'Sin lote' }}</p>
            </div>
            <span class="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-brand">{{ tag.status }}</span>
          </div>
          <p class="mt-3 text-sm text-slate-600">Mascota: {{ tag.pet?.nombre || 'Sin asignar' }}</p>
          @if (tag.publicUrl) {
            <a class="mt-3 block break-all text-sm text-brand" [href]="tag.publicUrl" target="_blank">{{ tag.publicUrl }}</a>
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

  batchForm = this.fb.nonNullable.group({ batch: ['LOTE-2026'], quantity: [10, [Validators.required, Validators.min(1), Validators.max(200)]] });
  singleForm = this.fb.nonNullable.group({ code: [''], batch: ['LOTE-2026'] });
  assignForm = this.fb.nonNullable.group({ code: ['', Validators.required], pet: ['', Validators.required] });

  ngOnInit() { this.load(); }
  availableTags() { return this.tags().filter((tag) => tag.status === 'AVAILABLE' || tag.status === 'SOLD'); }
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
