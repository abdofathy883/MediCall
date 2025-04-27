import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountService } from '../shared/servics/account.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css',
})
export class LogInComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  showPassword = false;
  errorMessage = '';
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    
    if (this.accountService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';

    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.subscription.add(
      this.accountService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigateByUrl('/');
        },
        error: (error) => {
          console.error('Login failed', error);
          this.errorMessage = error.error?.message || 'فشل تسجيل الدخول، يرجى التحقق من بيانات الدخول';
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      })
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
