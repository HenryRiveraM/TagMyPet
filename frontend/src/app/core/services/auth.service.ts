import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, User } from '../models/domain';

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'tagmypet_token';
  private readonly userKey = 'tagmypet_user';
  private readonly userState = signal<User | null>(this.readUser());
  user = this.userState.asReadonly();
  isLoggedIn = computed(() => !!this.token);

  constructor(private http: HttpClient, private router: Router) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(payload: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload).pipe(tap((res) => this.persist(res)));
  }

  register(payload: Partial<User> & { password: string }) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(tap((res) => this.persist(res)));
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/reset-password/${token}`, { password }).pipe(tap((res) => this.persist(res)));
  }

  verifyEmail(token: string) {
    return this.http.get<{ message: string }>(`${environment.apiUrl}/auth/verify-email/${token}`);
  }

  resendVerification() {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, {});
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userState.set(null);
    this.router.navigateByUrl('/login');
  }

  hasRole(roles: Role[]) {
    const role = this.userState()?.rol;
    return !!role && roles.includes(role);
  }

  private persist(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res.user));
    this.userState.set(res.user);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) as User : null;
  }
}
