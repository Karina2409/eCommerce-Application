import { Component } from '@angular/core';
import { HeaderComponent } from '@components/header/header.component';

@Component({
  selector: 'app-main-page',
  imports: [HeaderComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {}
