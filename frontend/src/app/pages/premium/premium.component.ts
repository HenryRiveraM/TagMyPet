import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PremiumRequest } from '../../core/models/domain';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule],
  styles: [`
    @keyframes premium-enter {
      from { opacity: 0; transform: translateY(14px) scale(.985); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes premium-glint {
      0% { transform: translateX(-120%) rotate(20deg); }
      100% { transform: translateX(420%) rotate(20deg); }
    }
    .premium-reveal { animation: premium-enter 420ms cubic-bezier(.2,.8,.2,1) both; }
    .premium-glint::after {
      content: "";
      position: absolute;
      inset: -30% auto -30% -18%;
      width: 16%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent);
      animation: premium-glint 1100ms 180ms ease-out both;
    }
    @media (prefers-reduced-motion: reduce) {
      .premium-reveal, .premium-glint::after { animation: none; }
    }
  `],
  template: `
    <section class="overflow-hidden rounded-lg border border-white/80 bg-white/90 shadow-xl shadow-stone-200/70">
      <div class="grid gap-0 lg:grid-cols-[1.06fr_.94fr]">
        <div class="p-6 md:p-10">
          <p class="eyebrow">Membresía anual</p>
          <h1 class="mt-3 max-w-xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">Premium para cuidar sin límites</h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-slate-600">Activa un año completo mediante QR bancario boliviano. El administrador valida tu comprobante antes de habilitar el plan.</p>
          <div class="mt-7 flex flex-wrap items-end gap-3">
            <span class="text-5xl font-bold tabular-nums text-slate-950">840 Bs</span>
            <span class="pb-2 text-sm font-semibold text-slate-500">por 12 meses · equivalente a 70 Bs/mes</span>
          </div>
          <div class="mt-7 grid gap-3 sm:grid-cols-2">
            @for (benefit of benefits; track benefit) {
              <div class="flex gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm font-semibold text-slate-700">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs text-white">✓</span>
                <span>{{ benefit }}</span>
              </div>
            }
          </div>
        </div>
        <div class="border-t border-stone-200 bg-stone-50 p-5 lg:border-l lg:border-t-0 md:p-8">
          <div class="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-bold text-slate-950">QR de pago BCP</p>
                <p class="mt-1 text-xs text-slate-500">Escanea desde tu banca móvil</p>
              </div>
              <span class="badge">Bolivia</span>
            </div>
            <img class="mx-auto mt-4 w-full max-w-[390px] rounded-md border border-stone-100 object-contain" src="/assets/premium-qr-bcp.jpg" alt="QR BCP para pago anual Premium TagMyPet">
            <p class="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><strong>Importante:</strong> el QR es de monto abierto. Ingresa <strong>840 Bs</strong> en tu app bancaria. QR válido hasta el 23 de mayo de 2027.</p>
            <a class="btn-outline mt-3 w-full" href="/assets/premium-qr-bcp.jpg" download="TagMyPet-Premium-QR-BCP.jpg">Guardar QR para pagar</a>
          </div>
        </div>
      </div>
    </section>

    @if (auth.user()?.plan === 'PREMIUM') {
      <section class="premium-reveal premium-glint relative mt-6 overflow-hidden rounded-lg border border-emerald-200 bg-white p-6 shadow-xl shadow-emerald-100 md:p-8">
        <div class="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <span class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-800">Premium activo</span>
            <h2 class="mt-4 text-3xl font-bold text-slate-950">Ya eres Premium, {{ auth.user()?.nombre }}</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">Tus herramientas avanzadas ya están habilitadas. Disfruta el cuidado completo de tus mascotas.</p>
          </div>
          <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-5 py-4">
            <p class="text-xs font-bold uppercase text-emerald-800">Vigente hasta</p>
            @if (auth.user()?.premiumExpiresAt) {
              <p class="mt-2 text-xl font-bold tabular-nums text-slate-950">{{ auth.user()?.premiumExpiresAt | date:'longDate' }}</p>
            } @else {
              <p class="mt-2 text-sm font-semibold text-slate-700">Activación anterior sin fecha registrada</p>
            }
          </div>
        </div>
      </section>
    } @else {
      <section class="mt-6 grid gap-5 lg:grid-cols-[.85fr_1.15fr]">
        <article class="panel">
          <p class="eyebrow">Pasos</p>
          <h2 class="mt-2 text-2xl font-bold">Cómo activar Premium</h2>
          <ol class="mt-6 space-y-5">
            @for (step of steps; track step.number) {
              <li class="flex gap-4">
                <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">{{ step.number }}</span>
                <div>
                  <p class="font-bold">{{ step.title }}</p>
                  <p class="mt-1 text-sm leading-6 text-slate-600">{{ step.text }}</p>
                </div>
              </li>
            }
          </ol>
        </article>
        <article class="panel">
          @if (latestRequest(); as request) {
            <div class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              [class.border-amber-200]="request.status === 'PENDING'"
              [class.bg-amber-50]="request.status === 'PENDING'"
              [class.border-red-200]="request.status === 'REJECTED'"
              [class.bg-red-50]="request.status === 'REJECTED'">
              <div>
                <p class="text-sm font-bold">Solicitud {{ statusLabel(request.status) }}</p>
                <p class="mt-1 text-xs text-slate-600">Referencia {{ request.paymentReference }} · {{ request.createdAt | date:'mediumDate' }}</p>
              </div>
              <span class="badge">{{ statusLabel(request.status) }}</span>
            </div>
          }
          @if (hasPending()) {
            <div class="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-8 text-center">
              <span class="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl text-amber-800">✓</span>
              <h2 class="mt-5 text-2xl font-bold">Comprobante recibido</h2>
              <p class="mt-2 max-w-md text-sm leading-6 text-slate-600">Tu pago anual está en revisión. Cuando el administrador lo apruebe, tu vigencia de 12 meses empezará ese mismo día.</p>
            </div>
          } @else {
            <p class="eyebrow">Enviar comprobante</p>
            <h2 class="mt-2 text-2xl font-bold">Solicitar activación</h2>
            <p class="mt-2 text-sm leading-6 text-slate-600">Sube únicamente el PDF emitido por tu banco. Será visible solo para administración durante la validación.</p>
            <form class="mt-6 space-y-4" [formGroup]="form" (ngSubmit)="submit()">
              <label class="block text-sm font-semibold text-slate-700">
                Referencia o número de transacción <span class="text-red-600">*</span>
                <input class="field mt-2" formControlName="paymentReference" placeholder="Ej. BCP-23819120">
              </label>
              <label class="block text-sm font-semibold text-slate-700">
                Comprobante bancario PDF <span class="text-red-600">*</span>
                <input class="field mt-2 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:font-semibold" type="file" accept="application/pdf,.pdf" (change)="pickReceipt($event)">
                <span class="mt-2 block text-xs font-normal text-slate-500">Formato PDF, máximo 5 MB. No se publicará en tu perfil.</span>
              </label>
              @if (receiptName()) {
                <div class="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">PDF listo: {{ receiptName() }}</div>
              }
              <label class="block text-sm font-semibold text-slate-700">
                Nota para revisión
                <textarea class="field mt-2 min-h-24 resize-y" formControlName="notes" placeholder="Opcional"></textarea>
              </label>
              <button class="btn w-full" [disabled]="submitting() || form.invalid || !receipt()">
                {{ submitting() ? 'Enviando comprobante...' : 'Enviar comprobante y solicitar Premium' }}
              </button>
            </form>
          }
        </article>
      </section>
    }
    <div class="mt-6 text-center text-sm text-slate-500">
      ¿Necesitas ayuda con el pago? <a class="font-bold text-brand" href="mailto:henryriveramendez@gmail.com">henryriveramendez&#64;gmail.com</a> · 76916697
    </div>
  `
})
export class PremiumComponent implements OnInit {
  private fb = inject(FormBuilder);
  requests = signal<PremiumRequest[]>([]);
  receipt = signal<File | null>(null);
  receiptName = signal('');
  submitting = signal(false);
  form = this.fb.nonNullable.group({
    paymentReference: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
    notes: ['', Validators.maxLength(400)]
  });
  benefits = ['Mascotas ilimitadas', 'Historial clínico completo', 'Recordatorios avanzados', 'Hasta 5 fotos por mascota', 'Adopciones y perdidos', 'Acceso veterinario autorizado'];
  steps = [
    { number: '1', title: 'Paga con QR', text: 'Escanea el QR BCP y coloca el monto anual de 840 Bs.' },
    { number: '2', title: 'Descarga el comprobante', text: 'Guarda el comprobante bancario en formato PDF.' },
    { number: '3', title: 'Espera aprobación', text: 'El admin revisa el PDF y activa tus 12 meses de Premium.' }
  ];

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.auth.refreshUser().subscribe({ next: () => this.load(), error: () => this.load() });
  }

  load() {
    this.api.myPremiumRequests().subscribe({ next: (requests) => this.requests.set(requests), error: () => this.toast.error('No se pudo cargar tu estado Premium') });
  }

  latestRequest() { return this.requests()[0]; }
  hasPending() { return this.latestRequest()?.status === 'PENDING'; }

  statusLabel(status: string) {
    return ({ PENDING: 'en revisión', APPROVED: 'aprobada', REJECTED: 'rechazada' } as Record<string, string>)[status] || status;
  }

  pickReceipt(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    if (!file) {
      this.receipt.set(null);
      this.receiptName.set('');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.toast.error('El comprobante debe ser un archivo PDF');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error('El PDF no puede superar 5 MB');
      input.value = '';
      return;
    }
    this.receipt.set(file);
    this.receiptName.set(file.name);
  }

  submit() {
    const receipt = this.receipt();
    if (this.form.invalid || !receipt) return;
    const data = new FormData();
    data.append('paymentReference', this.form.controls.paymentReference.value);
    data.append('notes', this.form.controls.notes.value);
    data.append('receipt', receipt);
    this.submitting.set(true);
    this.api.requestPremium(data).subscribe({
      next: () => {
        this.submitting.set(false);
        this.toast.success('Comprobante recibido. Tu solicitud está en revisión.');
        this.load();
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err.error?.message || 'No se pudo enviar el comprobante');
      }
    });
  }
}
