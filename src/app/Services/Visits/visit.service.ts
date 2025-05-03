import { Location, Patient } from './../user-management.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';
import { RequestNearNursesDTO, ServiceDto } from '../google-map.service';

export interface NewVisit {
  PatientLocation: {
    lat: number;
    lng: number;
  };
  ActualVisitDate: Data;
  Service: string;
  ScheduledDate: Date;
  PatientID: string;
}

export interface Visit {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class VisitService {
  private apiURL = 'http://localhost:5004/api';

  constructor(private http: HttpClient) {}

  // Get all available services
  getServices(): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(`${this.apiURL}/service`);
  }

  // Create a new visit request and find nearby nurses
  findNearestNurses(
    request: RequestNearNursesDTO
  ): Observable<RequestNearNursesDTO> {
    return this.http.post<RequestNearNursesDTO>(
      `${this.apiURL}/visit/find-nurse`,
      request
    );
  }

  // Accept a nurse for a visit
  acceptNurse(visitId: number, nurseId: string): Observable<any> {
    return this.http.post(`${this.apiURL}/visit/accept-nurse-by-patient`, {
      visitId,
      nurseId,
    });
  }

  // Get nearest nurses (legacy method - can be removed if not used)
  getNearestNurses(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiURL}/visit/nearest-nurses`);
  }

  // Send visit data (legacy method - can be replaced with findNearestNurses)
  sendVisitData(visitData: NewVisit): Observable<any> {
    return this.http.post(`${this.apiURL}/visit`, visitData);
  }
}
