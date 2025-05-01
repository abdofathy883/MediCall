import { Location } from './../user-management.service';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Data } from '@angular/router';
import { Observable } from 'rxjs';

export interface NewVisit {
  Location: {
    lat: string;
    lng: string;
  }
  ActualVisitDate: Data;
  ScheduledDate: Date;
  PatientID: string;
}

@Injectable({
  providedIn: 'root'
})

export class VisitService {
  private apiURL = '';
  constructor(private http: HttpClient) { }

  sendVisitData(formData: NewVisit): Observable<any>{
    return this.http.post(this.apiURL, formData);
  }

  getNearestNurses(){
    return this.http.get<any>(`${this.apiURL}/visit`)
  }
}
