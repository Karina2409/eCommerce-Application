import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgForOf, NgIf, Location } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { Image, ProductProjection, ProductVariant } from '@commercetools/platform-sdk';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '@services/product-service';
import { ImagesModalComponent } from '@components/images-modal';
import { ProductDetailService } from '@services/product-detail-service';
import { CartManipulationService, CartService, CurrentCart } from '@services/cart-service';
import { AuthService } from '@services/auth-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [MatButton, NgForOf, NgIf],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  public locale = 'en-US';
  public images: Image[] = [];
  public currentImgIndex = 0;
  public currentProductId = '';
  public slug = signal<string | null>(null);
  public product = signal<ProductProjection | null>(null);
  public isInCart = signal<boolean>(false);
  public variantId = 1;
  public allVariants: ProductVariant[] = [];
  public productDetailService: ProductDetailService = inject(ProductDetailService);
  protected authService: AuthService = inject(AuthService);
  protected cartService: CartService = inject(CartService);
  protected cartManipulation: CartManipulationService = inject(CartManipulationService);

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private location: Location,
    private dialog: MatDialog,
  ) {
    effect(() => {
      const currentSlug = this.slug();
      if (currentSlug) {
        this.fetchProductBySlug(currentSlug);
      }
    });
    effect(() => {
      if (this.cartService) {
        const isInCart = CurrentCart.isProductByID(this.currentProductId);
        this.isInCart.set(isInCart);
      }
    });
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

  public ngOnInit() {
    const slugFromRoute = this.route.snapshot.paramMap.get('name');
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    this.slug.set(slugFromRoute);
    if (idFromRoute) this.variantId = Number(idFromRoute);
  }

  public goBack() {
    this.location.back();
  }

  public openModal(images: Image[]) {
    this.dialog.open(ImagesModalComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'fullscreen-dialog',
      data: { images },
    });
  }

  private async fetchProductBySlug(slug: string) {
    try {
      const response = await this.productService.getProductBySlug(slug);
      this.currentProductId = response.body.results[0].id;
      this.product.set(response.body.results[0] ?? null);
      this.allVariants = [this.product()!.masterVariant];
      this.images = this.allVariants[this.variantId - 1].images ?? [];
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message);
      } else {
        throw new Error('Unknown error occurred');
      }
    }
  }
}
