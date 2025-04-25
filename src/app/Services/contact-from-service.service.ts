import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactForm {
  name: string;
  phone: string;
  email: string;
  message: string;
  timeStamp: Date; // Added timeStamp property
}
@Injectable({
  providedIn: 'root'
})
export class ContactFromServiceService {
  
  private apiUrl = 'https://example.com/api/contact'; // Replace with your API endpoint
  constructor(private http: HttpClient) { }
  
  sendContactForm(formData: ContactForm): Observable<any> {
    return this.http.post(this.apiUrl, formData);
  }
}
