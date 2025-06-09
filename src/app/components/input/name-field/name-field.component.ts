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
  @Input({ required: true }) public control!: FormControl<string | null>;
  @Input({ required: true }) public id!: string;
  @Input() public placeholder = '';
}
