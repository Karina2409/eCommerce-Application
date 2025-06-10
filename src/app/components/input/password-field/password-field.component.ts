import {
  Component,
  EventEmitter,
  Input,
  Output,
  WritableSignal,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, MatIcon, MatTooltip],
  templateUrl: './password-field.component.html',
  styleUrl: '../input-field.scss',
})
export class PasswordFieldComponent implements OnInit {
  @Output() public passwordChange = new EventEmitter<FormControl>();
  @Input() public label!: string;
  @Input({ required: true }) public control!: FormControl;

  public isPasswordShown: WritableSignal<boolean> = signal(false);

  public ngOnInit() {
    this.passwordChange.emit(this.control);
  }

  public togglePasswordVisibility(): void {
    this.isPasswordShown.update((value) => !value);
  }
}
