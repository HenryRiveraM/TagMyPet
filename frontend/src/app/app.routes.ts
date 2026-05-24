import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/auth/register.component').then((m) => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/account/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/account/reset-password.component').then((m) => m.ResetPasswordComponent) },
  { path: 'verify-email', loadComponent: () => import('./pages/account/verify-email.component').then((m) => m.VerifyEmailComponent) },
  { path: 'privacidad', loadComponent: () => import('./pages/legal/privacy.component').then((m) => m.PrivacyComponent) },
  { path: 'terminos', loadComponent: () => import('./pages/legal/terms.component').then((m) => m.TermsComponent) },
  { path: 'pet/public/:nfcCode', loadComponent: () => import('./pages/nfc/nfc-profile.component').then((m) => m.NfcProfileComponent) },
  { path: 'perdidos', loadComponent: () => import('./pages/lost/lost.component').then((m) => m.LostComponent) },
  { path: 'adopciones', loadComponent: () => import('./pages/adoptions/adoptions.component').then((m) => m.AdoptionsComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent) },
  { path: 'perfil', canActivate: [authGuard], loadComponent: () => import('./pages/account/profile.component').then((m) => m.ProfileComponent) },
  { path: 'notificaciones', canActivate: [authGuard], loadComponent: () => import('./pages/notifications/notifications.component').then((m) => m.NotificationsComponent) },
  { path: 'premium', canActivate: [authGuard, roleGuard], data: { roles: ['OWNER'] }, loadComponent: () => import('./pages/premium/premium.component').then((m) => m.PremiumComponent) },
  { path: 'mascotas', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN', 'OWNER', 'VETERINARIO'] }, loadComponent: () => import('./pages/pets/pets.component').then((m) => m.PetsComponent) },
  { path: 'historial', canActivate: [authGuard], loadComponent: () => import('./pages/medical/medical.component').then((m) => m.MedicalComponent) },
  { path: 'recordatorios', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN', 'OWNER'] }, loadComponent: () => import('./pages/reminders/reminders.component').then((m) => m.RemindersComponent) },
  { path: 'clinicas', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN', 'OWNER', 'VETERINARIO'] }, loadComponent: () => import('./pages/clinics/clinics.component').then((m) => m.ClinicsComponent) },
  { path: 'tags-nfc', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN', 'OWNER'] }, loadComponent: () => import('./pages/tags/tags.component').then((m) => m.TagsComponent) },
  { path: 'admin', canActivate: [authGuard, roleGuard], data: { roles: ['ADMIN'] }, loadComponent: () => import('./pages/admin/admin.component').then((m) => m.AdminComponent) },
  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component').then((m) => m.NotFoundComponent) }
];
