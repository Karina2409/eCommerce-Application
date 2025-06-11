import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-modal',
  imports: [MatButtonModule, MatIcon],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  @Input() public show = false;

  @Output() public closeModal = new EventEmitter<void>();

  public onClose(): void {
    this.closeModal.emit();
  }
}
