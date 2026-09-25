import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice);
  }

  updateInvoice(id: string, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  deleteInvoice(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  downloadPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  previewPdf(invoice: Invoice): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/generate-pdf`, invoice, { responseType: 'blob' });
  }
}
