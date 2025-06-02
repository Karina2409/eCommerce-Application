import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { NgForOf, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    MatButton,
    NgForOf,
    NgIf,
    MatDialogClose,
    MatDialogActions,
    MatDialogTitle,
    MatDialogContent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  public data = inject(MAT_DIALOG_DATA);
  public variant = inject(MAT_DIALOG_DATA).variant;
  public images = this.variant?.images ?? [];
  public currentImgIndex = 0;

  public selectImg(index: number) {
    this.currentImgIndex = index;
  }

  public prevImg() {
    if (this.currentImgIndex > 0) {
      this.currentImgIndex--;
    }
  }

  public nextImg() {
    if (this.currentImgIndex < this.images.length - 1) {
      this.currentImgIndex++;
    }
  }
}
