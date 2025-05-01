import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactForm, ContactFromServiceService } from '../Services/contact-from-service.service'; // Adjust the import path as needed


@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
  
})
export class ContactComponent {

  formData: ContactForm = {
    name: '',
    phone: '',
    email: '',
    message: '',
    timeStamp: new Date()
  };

  constructor(private ContactService: ContactFromServiceService) { }

  onSubmit(form: NgForm) : void {
    if (form.valid) {
      this.formData.timeStamp = new Date(); // Update the timestamp on form submission
      this.ContactService.sendContactForm(this.formData).subscribe({
        next: (response) => {
          console.log('Form submitted successfully:', response);
          form.reset(); // Reset the form after successful submission
          
          // Optionally, you can show a success message to the user here
          alert('Your message has been sent successfully!');

        },
        error: (error) => {
          console.error('Error submitting form:', error);
        }
      });
    } 

  }
}
