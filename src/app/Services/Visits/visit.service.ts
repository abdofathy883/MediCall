// import { NurseDetailsDto, ResponseNearNursesDTO } from './../google-map.service';
import { Location, Patient } from './../user-management.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewVisit {
  patientId: string;
  PatientLocation: {
    lat: number;
    lng: number;
  }
  servicesIds: number[];
}

export interface Visit {
  id: number;
  patientId: string;
  nurseId: string;
  service: string;
  scheduledDate: Date;
  actualVisitDate: Date;
  status: string;
  patientLocation: {
    lat: number;
    lng: number;
  }
}

export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  basePrice: number;
}

export interface NurseDetailsDto{
  id: string;
  firstName: string;
  lastName: string;
  experienceYears: number;
  visitCount: number;
  phoneNumber?: string;
}

export interface ResponseNearNursesDTO {
  success: boolean;
  message: string;
  nurses: NurseDetailsDto[];
  visit?: {id: number};
  // visit?: any;
}

export interface RequestNearNursesDTO {
  patientId: string;
  patientLocation: {
    lat: number;
    lng: number;
  }
  servicesIds: number[];
}

@Injectable({
  providedIn: 'root'
})

export class VisitService {
  private apiURL = 'http://localhost:5004/api';
  constructor(private http: HttpClient) { }

  sendVisitData(formData: RequestNearNursesDTO): Observable<ResponseNearNursesDTO>{
    return this.http.post<ResponseNearNursesDTO>(this.apiURL + '/visit/find-nurse', formData);
  }

  getServices(): Observable<ServiceDto[]>{
    // return this.http.get<ServiceDto[]>(`${this.apiURL}/Service/get-services`)
    return this.http.get<ServiceDto[]>(`${this.apiURL}/GetData/services`)
  }

  // getNearestNurses(): Observable<string[]>{
  //   return this.http.get<string[]>(`${this.apiURL}/visit/find-nurse`)
  // }

  acceptNurseByPatient(visitId: number, nurseId: string): Observable<any> {
    return this.http.post(`${this.apiURL}/visit/accept-nurse-by-patient?visitId=${visitId}&nurseId=${nurseId}`, { });
    // return this.http.post(`${this.apiURL}/visit/accept-nurse-by-patient`, { visitId, nurseId });
  }

  cancelVisitByPatient(visitId: number, cancellationReason: string): Observable<any> {
    return this.http.post(`${this.apiURL}/visit/cancel-visit-by-patient`, { visitId, cancellationReason });
  }

  completeVisitByPatient(visitId: number): Observable<any> {
    return this.http.post(`${this.apiURL}/visit/complete-visit-by-patient`, { visitId });
  }
}
