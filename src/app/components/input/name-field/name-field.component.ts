import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-name-field',
  imports: [ReactiveFormsModule],
  templateUrl: './name-field.component.html',
  styleUrl: '../input-field.scss',
})
export class NameFieldComponent {
  @Input({ required: true }) public label!: string;
  @Input({ required: true }) public control!: FormControl;
  @Input({ required: true }) public id!: string;
  @Input() public placeholder = '';

  public get showValidationError(): boolean {
    return this.control?.invalid && (this.control?.dirty || this.control?.touched);
  }
}
