import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-field',
  imports: [ReactiveFormsModule],
  templateUrl: './email-field.component.html',
  styleUrl: '../input-field.scss',
})
export class EmailFieldComponent {
  @Input({ required: true }) public control!: FormControl;
}
