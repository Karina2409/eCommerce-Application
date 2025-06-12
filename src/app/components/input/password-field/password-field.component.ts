import { Component, Input, WritableSignal, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, MatIcon, MatTooltip],
  templateUrl: './password-field.component.html',
  styleUrl: '../input-field.scss',
})
export class PasswordFieldComponent {
  @Input() public label!: string;
  @Input({ required: true }) public control!: FormControl<string | null>;
  @Input({ required: true }) public id!: string;

  public isPasswordShown: WritableSignal<boolean> = signal(false);

  public togglePasswordVisibility(): void {
    this.isPasswordShown.update((value) => !value);
  }
}
