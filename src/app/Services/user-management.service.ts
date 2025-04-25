import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  email: string;
  phone: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})

export class UserManagementService {
  private apiURL = 'https://example.com/api/users'; // Replace with your API endpoint
  constructor(private http: HttpClient) { }

  registerUser(userData: User): Observable<any> {
    return this.http.post(this.apiURL, userData);
  }

  getByUserId(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiURL}/${userId}`);
  }
}
