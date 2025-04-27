import { Injectable } from '@angular/core';
import { CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class CoockiesService {

  constructor(private cookieService: CookieService) { }

  setCookie(name: string, value: string, days: number): void {
    // const date = new Date();
    // date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    // const expires = "expires=" + date.toUTCString();
    this.cookieService.set(name, value, days, '/', '', true, 'Strict');
  }

  getCookie(name: string): string | null {
    return this.cookieService.get(name);
  }

  deleteCookie(name: string): void {
    this.cookieService.delete(name, '/');
  }
}
