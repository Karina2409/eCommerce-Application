import { Component } from '@angular/core';

@Component({
  selector: 'app-profile-page',
  imports: [],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
})
export class ProfilePageComponent {
  public user;

  constructor() {
    this.user = {
      email: 'kserduk@mail.ru',
      firstName: 'Karina',
      lastName: 'Siardziuk',
      dateOfBirth: '2004-09-24',
      addresses: [
        {
          id: '_ZcEfF0Q',
          streetName: 'prospekt N 43, apt. 1',
          postalCode: '220022',
          city: 'Minsk',
          country: 'BY',
        },
      ],
    };
  }
}
