import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapService {
  private apiURL = '';
  constructor(private http: HttpClient) { }

  sendMyLocation(lat: number, lng: number) {
    return this.http.post(`${this.apiURL}/location/update`, { latitude: lat, longitude: lng });
  }

  getNearbyNurses(lat: number, lng: number) {
    return this.http.get<any[]>(`${this.apiURL}/location/nearby?lat=${lat}&lng=${lng}`);
  }
}
