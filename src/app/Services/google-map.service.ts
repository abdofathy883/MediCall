import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// Interface for Location model
export interface Location {
  lat: number;
  lng: number;
}

// Interface for ServiceDto
export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  basePrice: number;
}

// Interface for NurseDetailsDto
export interface NurseDetailsDto {
  id: string;
  firstName: string;
  lastName: string;
  experienceYears: number;
  isAvailable: boolean;
  isVerified: boolean;
  dateOfBirth?: string;
  profilePicture?: string;
  visitCount: number;
  phoneNumber?: string;
}

// Interface for PatientDetailsDto
export interface PatientDetailsDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  profilePicture?: string;
  location?: Location;
  patientIllnesses: any[];
  visits?: string[];
  phoneNumber?: string;
}

// Interface for VisitDTO
export interface VisitDTO {
  id: number;
  actualVisitDate?: Date;
  scheduledDate: Date;
  status: string; // Corresponds to VisitStatus enum
  notes?: string;
  cancellationReason?: string;
  serviceCost: number;
  transportationCost: number;
  totalCost: number;
  patientLocation: Location;
  nurseLocation?: Location;
  nurseId?: string;
  patientId: string;
  services: ServiceDto[];
  nurse?: NurseDetailsDto;
  patient: PatientDetailsDto;
}

// Interface for RequestNearNursesDTO
export interface RequestNearNursesDTO {
  patientId: string;
  serviceIds: number[];

  patientLocation: Location;
  scheduledDate: Date;
  actualVisitDate: Date;
}

// Interface for ResponseNearNursesDTO
export interface ResponseNearNursesDTO {
  success: boolean;
  message: string;
  nurses: NurseDetailsDto[];
}

@Injectable({
  providedIn: 'root'
})
export class GoogleMapService {
  private apiURL = 'http://localhost:5004/api';
  
  constructor(private http: HttpClient) { }

  sendMyLocation(lat: number, lng: number) {
    // return this.http.post(`${this.apiURL}/location/update`, { latitude: lat, longitude: lng });
    return of({ success: true})
  }

  getNearbyNurses(lat: number, lng: number): Observable<any[]> {
    // return this.http.get<any[]>(`${this.apiURL}/location/nearby?lat=${lat}&lng=${lng}`);
    return of([]);

  }

  // New method to find nearest nurses for a visit
  findNearestNurses(request: RequestNearNursesDTO): Observable<ResponseNearNursesDTO> {
    return this.http.post<ResponseNearNursesDTO>(`${this.apiURL}/visit/find-nurse`, request);
  }
}
