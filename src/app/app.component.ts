import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@components/header';
import { CurrentCart } from '@services/cart-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  public title = 'Devices';

  public ngOnInit() {
    void this;
    const currentCart = localStorage.getItem('current-cart');
    if (currentCart) CurrentCart.setCart(JSON.parse(currentCart));
  }
}
