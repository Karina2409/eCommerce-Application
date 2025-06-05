import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-field',
  imports: [ReactiveFormsModule],
  templateUrl: './date-field.component.html',
  styleUrl: '../input-field.scss',
})
export class DateFieldComponent implements OnInit {
  @Input({ required: true }) public control!: FormControl;
  @Input() public value: string | undefined;
  public maxDate = '';

  public ngOnInit(): void {
    const today = new Date();
    const thirteenYearsAgo = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());

    this.maxDate = thirteenYearsAgo.toISOString().split('T')[0];

    if (this.value && !this.control.value) {
      const date = new Date(this.value);
      const formatted = date.toISOString().split('T')[0];
      this.control.setValue(formatted);
    }
  }
}
