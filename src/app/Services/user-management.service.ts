import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Location {
  Lat: number;
  Lng: number;
}

export interface UserRegister {
  nationalId: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string;
  phone: string;
  firstName: string;
  lastName: string;
  Role: string;
  dateOfBirth: Date;
  gender: string;
  location: Location;
}

export interface UserLogin {
  email: string;
  password: string;
}
@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private LoggedIn = new BehaviorSubject<boolean>(false);
  private apiURLLogin = 'https://localhost:44364/api/AuthController/Login'; // Replace with your API endpoint
  private apiURLRegister = 'https://localhost:44364/api/AuthController/Register'; // Replace with your API endpoint
  constructor(private http: HttpClient) {}

  get isLoggedIn(): Observable<boolean> {
    return this.LoggedIn.asObservable();
  }

  registerUser(userData: UserRegister): Observable<any> {
    return this.http.post(this.apiURLRegister, userData);
  }

  sendUserLoginData(userData: UserLogin): Observable<any> {
    this.LoggedIn.next(true); // Update the login status
    return this.http.post(this.apiURLLogin, userData);
  }

  getByUserId(userId: number): Observable<UserRegister> {
    return this.http.get<UserRegister>(`${this.apiURLRegister}/${userId}`);
  }
  
}
