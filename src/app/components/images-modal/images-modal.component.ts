import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { Image } from '@commercetools/platform-sdk';

@Component({
  selector: 'app-images-modal',
  imports: [MatButton],
  templateUrl: './images-modal.component.html',
  styleUrl: './images-modal.component.scss',
})
export class ImagesModalComponent {
  public images: Image[];
  public currentImgIndex = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { images: Image[] }) {
    this.images = data.images;
  }

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
