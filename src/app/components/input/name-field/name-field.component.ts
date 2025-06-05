import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-name-field',
  imports: [ReactiveFormsModule],
  templateUrl: './name-field.component.html',
  styleUrl: '../input-field.scss',
})
export class NameFieldComponent implements OnInit {
  @Input({ required: true }) public label!: string;
  @Input({ required: true }) public control!: FormControl;
  @Input({ required: true }) public id!: string;
  @Input() public placeholder = '';
  @Input() public value: string | undefined = '';

  public ngOnInit() {
    if (this.value !== undefined) {
      this.control.setValue(this.value);
    }
  }
}
