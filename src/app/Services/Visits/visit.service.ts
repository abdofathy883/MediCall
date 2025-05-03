import { Location, Patient } from './../user-management.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';

export interface NewVisit {
  PatientLocation: {
    lat: number;
    lng: number;
  }
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
  providedIn: 'root'
})

export class VisitService {
  private apiURL = 'http://localhost:5004/api';
  constructor(private http: HttpClient) { }

  sendVisitData(formData: NewVisit): Observable<any>{
    return this.http.post(this.apiURL + '/visit/FindNearestNurses', + formData);
  }

  getServices(){
    return this.http.get<any>(`${this.apiURL}/Service/GetAllServices`)
  }

  getNearestNurses(){
    return this.http.get<any>(`${this.apiURL}/visit/FindNearestNurses`)
  }
}
