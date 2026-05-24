import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="mx-auto max-w-5xl">
      <div class="mb-7">
        <p class="eyebrow">Cuenta personal</p>
        <h1 class="mt-2 text-3xl font-bold">Mi perfil</h1>
        <p class="mt-2 text-slate-600">Mantén actualizados tus datos de contacto para perfiles NFC y alertas importantes.</p>
      </div>
      <div class="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <article class="panel">
          <h2 class="text-xl font-bold">Datos personales</h2>
          <form class="mt-5 space-y-4" [formGroup]="profile" (ngSubmit)="saveProfile()">
            <div class="flex flex-col gap-4 rounded-lg bg-stone-50 p-4 sm:flex-row sm:items-center">
              <img class="h-20 w-20 rounded-full border border-stone-200 bg-white object-cover" [src]="avatarPreview() || auth.user()?.avatar || '/assets/tagmypet-logo.png'" alt="Foto de perfil">
              <label class="btn-outline cursor-pointer text-center">Elegir foto
                <input #avatarInput class="sr-only" type="file" accept="image/*" (change)="pickAvatar($event)">
              </label>
              <span class="text-xs text-slate-500">Opcional · JPG o PNG</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <input class="field" formControlName="nombre" placeholder="Nombre *">
              <input class="field" formControlName="apellido" placeholder="Apellido *">
              <input class="field" formControlName="telefono" placeholder="Teléfono *">
              <input class="field" formControlName="ciudad" placeholder="Ciudad *">
            </div>
            <input class="field bg-stone-50" [value]="auth.user()?.email || ''" disabled aria-label="Email">
            <button class="btn w-full sm:w-auto" [disabled]="profile.invalid || saving()">{{ saving() ? 'Guardando...' : 'Guardar perfil' }}</button>
          </form>
        </article>
        <div class="space-y-6">
          <article class="panel">
            <h2 class="text-xl font-bold">Seguridad</h2>
            <form class="mt-5 space-y-3" [formGroup]="password" (ngSubmit)="savePassword()">
              <input class="field" type="password" formControlName="currentPassword" placeholder="Contraseña actual *">
              <input class="field" type="password" formControlName="password" placeholder="Nueva contraseña *">
              <button class="btn-outline w-full" [disabled]="password.invalid">Actualizar contraseña</button>
            </form>
          </article>
          <article class="panel border-red-100">
            <h2 class="text-xl font-bold">Eliminar mi cuenta</h2>
            @if (auth.user()?.deletionStatus === 'PENDING') {
              <p class="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-900">Tu solicitud está en revisión administrativa.</p>
            } @else {
              <p class="mt-2 text-sm text-slate-600">Revisaremos la solicitud para proteger historiales, adopciones y datos NFC antes de eliminar información.</p>
              <form class="mt-4 space-y-3" [formGroup]="deletion" (ngSubmit)="requestDeletion()">
                <textarea class="field min-h-24" formControlName="reason" placeholder="Motivo de la eliminación *"></textarea>
                <button class="w-full rounded-md border border-red-200 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50" [disabled]="deletion.invalid">Solicitar eliminación</button>
              </form>
            }
          </article>
        </div>
      </div>
    </section>
  `
})
export class ProfileComponent {
  @ViewChild('avatarInput') avatarInput?: ElementRef<HTMLInputElement>;
  private fb = inject(FormBuilder);
  auth = inject(AuthService);
  private toast = inject(ToastService);
  saving = signal(false);
  avatarPreview = signal<string | null>(null);
  private avatar?: File;
  profile = this.fb.nonNullable.group({
    nombre: [this.auth.user()?.nombre || '', Validators.required],
    apellido: [this.auth.user()?.apellido || '', Validators.required],
    telefono: [this.auth.user()?.telefono || '', Validators.required],
    ciudad: [this.auth.user()?.ciudad || '', Validators.required]
  });
  password = this.fb.nonNullable.group({ currentPassword: ['', Validators.required], password: ['', [Validators.required, Validators.minLength(8)]] });
  deletion = this.fb.nonNullable.group({ reason: ['', [Validators.required, Validators.minLength(10)]] });

  pickAvatar(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.avatar = file;
    this.avatarPreview.set(URL.createObjectURL(file));
  }
  saveProfile() {
    const data = new FormData();
    Object.entries(this.profile.getRawValue()).forEach(([key, value]) => data.append(key, value));
    if (this.avatar) data.append('avatar', this.avatar);
    this.saving.set(true);
    this.auth.updateProfile(data).subscribe({
      next: () => { this.saving.set(false); this.toast.success('Perfil actualizado'); },
      error: (err) => { this.saving.set(false); this.toast.error(err.error?.message || 'No se pudo actualizar el perfil'); }
    });
  }
  savePassword() {
    this.auth.changePassword(this.password.getRawValue()).subscribe({
      next: () => { this.password.reset(); this.toast.success('Contraseña actualizada'); },
      error: (err) => this.toast.error(err.error?.message || 'No se pudo actualizar la contraseña')
    });
  }
  requestDeletion() {
    if (!confirm('¿Enviar la solicitud de eliminación de cuenta?')) return;
    this.auth.requestDeletion(this.deletion.controls.reason.value).subscribe({
      next: () => this.toast.success('Solicitud de eliminación enviada'),
      error: (err) => this.toast.error(err.error?.message || 'No se pudo enviar la solicitud')
    });
  }
}
