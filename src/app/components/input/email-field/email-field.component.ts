import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-email-field',
  imports: [ReactiveFormsModule],
  templateUrl: './email-field.component.html',
  styleUrl: '../input-field.scss',
})
export class EmailFieldComponent {
  @Output() public emailChange = new EventEmitter<FormControl>();
  @Input({ required: true }) public control!: FormControl;
}
