import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-modal',
  imports: [MatButtonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() public show = false;

  @Output() public closeModal = new EventEmitter<void>();
  @Output() public confirm = new EventEmitter<void>();

  public onClose(): void {
    this.closeModal.emit();
  }

  public onConfirm(): void {
    this.confirm.emit();
  }
}
