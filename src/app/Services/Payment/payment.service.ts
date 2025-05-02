import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private http: HttpClient) {}

  getIframeData(): Observable<{ paymentKey: string; iframeId: string }> {
    return this.http.get<{ paymentKey: string; iframeId: string }>(
      '/api/payment/createpayment' // Your backend endpoint
    );
  }
}
