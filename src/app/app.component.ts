import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./header/header.component";
import { FooterComponent } from "./footer/footer.component";
import { UserManagementService } from './Services/user-management.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'MediCall';
  isLoggedIn: boolean = false;

  constructor(private userService: UserManagementService) {}

  ngOnInit() {
    this.userService.isLoggedIn.subscribe(status => {
      this.isLoggedIn = status;
    });
  }
}
