import { Component, EventEmitter, Input, Output, WritableSignal, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule],
  templateUrl: './password-field.component.html',
  styleUrl: '../input-field.scss',
})
export class PasswordFieldComponent implements OnInit {
  @Output() public passwordChange = new EventEmitter<FormControl>();
  @Input({ required: true }) public control!: FormControl;
  @Input({ required: true }) public isPasswordShown!: WritableSignal<boolean>;

  public ngOnInit() {
    this.passwordChange.emit(this.control);
  }
}
