import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Adoption, AdoptionApplication, Clinic, LostReport, NfcTag, Notification, Pet, PetAccessRequest, PremiumRequest, Reminder, Sighting, User } from '../models/domain';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private cleanParams(filters: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(filters)
        .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
        .map(([key, value]) => [key, String(value)])
    );
  }

  pets() { return this.http.get<Pet[]>(`${this.api}/pets`); }
  createPet(data: FormData) { return this.http.post<Pet>(`${this.api}/pets`, data); }
  updatePet(id: string, data: FormData) { return this.http.put<Pet>(`${this.api}/pets/${id}`, data); }
  deletePet(id: string) { return this.http.delete<void>(`${this.api}/pets/${id}`); }
  publicPet(code: string) { return this.http.get<Partial<Pet> & { contacto: User }>(`${this.api}/pets/public/${code}`); }
  medicalRecords(petId: string) { return this.http.get<unknown[]>(`${this.api}/medical-records/pet/${petId}`); }
  createMedicalRecord(data: object) { return this.http.post(`${this.api}/medical-records`, data); }
  reminders() { return this.http.get<Reminder[]>(`${this.api}/reminders`); }
  createReminder(data: object) { return this.http.post(`${this.api}/reminders`, data); }
  toggleReminder(id: string) { return this.http.patch<Reminder>(`${this.api}/reminders/${id}/toggle`, {}); }
  lostReports(filters: { texto?: string; ciudad?: string; especie?: string; raza?: string } = {}) {
    const params = this.cleanParams(filters);
    return this.http.get<LostReport[]>(`${this.api}/lost`, { params });
  }
  createLost(data: object) { return this.http.post(`${this.api}/lost`, data); }
  markFound(id: string) { return this.http.patch(`${this.api}/lost/${id}/found`, {}); }
  createSighting(id: string, data: object) { return this.http.post<{ message: string }>(`${this.api}/lost/${id}/sightings`, data); }
  sightings(id: string) { return this.http.get<Sighting[]>(`${this.api}/lost/${id}/sightings`); }
  adoptions(filters: { especie?: string; raza?: string; edad?: string | number } = {}) {
    const params = this.cleanParams(filters);
    return this.http.get<Adoption[]>(`${this.api}/adoptions`, { params });
  }
  createAdoption(data: object) { return this.http.post(`${this.api}/adoptions`, data); }
  applyAdoption(id: string, data: object) { return this.http.post(`${this.api}/adoptions/${id}/apply`, data); }
  adoptionApplications() { return this.http.get<AdoptionApplication[]>(`${this.api}/adoptions/applications`); }
  decideAdoptionApplication(id: string, etapa: 'IN_REVIEW' | 'APPROVED' | 'DELIVERED' | 'REJECTED', interview: object = {}) { return this.http.patch<AdoptionApplication>(`${this.api}/adoptions/applications/${id}/status`, { etapa, ...interview }); }
  completeAdoptionFollowUp(id: string, days: number, notas = '') { return this.http.patch<AdoptionApplication>(`${this.api}/adoptions/applications/${id}/follow-ups/${days}`, { notas }); }
  closeAdoption(id: string) { return this.http.patch<Adoption>(`${this.api}/adoptions/${id}/close`, {}); }
  adminStats() { return this.http.get<Record<string, number>>(`${this.api}/admin/stats`); }
  users() { return this.http.get<User[]>(`${this.api}/admin/users`); }
  updateUserStatus(id: string, estado: string) { return this.http.patch<User>(`${this.api}/admin/users/${id}/status`, { estado }); }
  deletionRequests() { return this.http.get<User[]>(`${this.api}/admin/deletion-requests`); }
  resolveDeletionRequest(id: string) { return this.http.patch<User>(`${this.api}/admin/deletion-requests/${id}/resolve`, {}); }
  clinics() { return this.http.get<Clinic[]>(`${this.api}/clinics`); }
  createClinic(data: object) { return this.http.post<Clinic>(`${this.api}/clinics`, data); }
  updateClinicStatus(id: string, estado: 'PENDING' | 'ACTIVE' | 'SUSPENDED') { return this.http.patch<Clinic>(`${this.api}/clinics/${id}/status`, { estado }); }
  addVeterinarian(clinicId: string, email: string) { return this.http.post<Clinic>(`${this.api}/clinics/${clinicId}/veterinarians`, { email }); }
  accessRequests() { return this.http.get<PetAccessRequest[]>(`${this.api}/clinics/access/requests`); }
  requestPetAccess(data: object) { return this.http.post<PetAccessRequest>(`${this.api}/clinics/access/requests`, data); }
  decidePetAccess(id: string, status: 'APPROVED' | 'REJECTED' | 'REVOKED') { return this.http.patch<PetAccessRequest>(`${this.api}/clinics/access/requests/${id}`, { status }); }
  tags() { return this.http.get<NfcTag[]>(`${this.api}/tags`); }
  createTag(data: object) { return this.http.post<NfcTag>(`${this.api}/tags`, data); }
  createTagBatch(data: object) { return this.http.post<NfcTag[]>(`${this.api}/tags/batch`, data); }
  assignTag(code: string, pet: string) { return this.http.patch<NfcTag>(`${this.api}/tags/${code}/assign`, { pet }); }
  updateTagStatus(id: string, status: string, notes = '') { return this.http.patch<NfcTag>(`${this.api}/tags/${id}/status`, { status, notes }); }
  exportTagsCsv() { return this.http.get(`${this.api}/tags/export.csv`, { observe: 'response', responseType: 'blob' }); }
  sendReminderNotifications(daysAhead = 2) { return this.http.post<{ sent: number }>(`${this.api}/reminders/send-notifications?daysAhead=${daysAhead}`, {}); }
  myPremiumRequests() { return this.http.get<PremiumRequest[]>(`${this.api}/premium/me`); }
  requestPremium(data: FormData) { return this.http.post<PremiumRequest>(`${this.api}/premium`, data); }
  premiumRequests() { return this.http.get<PremiumRequest[]>(`${this.api}/premium`); }
  premiumReceiptLink(id: string) { return this.http.get<{ url: string; expiresInSeconds: number }>(`${this.api}/premium/${id}/receipt`); }
  decidePremiumRequest(id: string, status: 'APPROVED' | 'REJECTED') { return this.http.patch<PremiumRequest>(`${this.api}/premium/${id}/status`, { status }); }
  notifications() { return this.http.get<Notification[]>(`${this.api}/notifications`); }
  unreadNotificationCount() { return this.http.get<{ count: number }>(`${this.api}/notifications/unread-count`); }
  readNotification(id: string) { return this.http.patch<Notification>(`${this.api}/notifications/${id}/read`, {}); }
  readAllNotifications() { return this.http.patch(`${this.api}/notifications/read-all`, {}); }
}
