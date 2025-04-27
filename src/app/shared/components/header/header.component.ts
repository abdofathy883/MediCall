import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../servics/account.service';
import { Subscription } from 'rxjs';
import { User } from '../../models/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private accountService = inject(AccountService);
  private router = inject(Router);
  
  currentUser: User | null = null;
  isNavbarCollapsed = true;
  private subscription = new Subscription();
  
  ngOnInit(): void {
    this.subscription.add(
      this.accountService.user$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  
  logout(): void {
    this.accountService.logout().subscribe({
      next: () => {
        this.router.navigate(['/account/login']);
      }
    });
  }
  
  get isLoggedIn(): boolean {
    return this.accountService.isLoggedIn();
  }
  
  get isNurse(): boolean {
    return this.accountService.isNurse();
  }
  
  get isPatient(): boolean {
    return this.accountService.isPatient();
  }
}
