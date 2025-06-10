import { Component, OnInit } from '@angular/core';
import { Teammate } from '@models/types';
import { team } from '@data/teammates';
import { NgForOf } from '@angular/common';
import { TeammateCardComponent } from '@components/teammate-card/teammate-card.component';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-about-page',
  imports: [NgForOf, TeammateCardComponent, MatDivider],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
})
export class AboutPageComponent implements OnInit {
  public team: Teammate[] = [];
  public ngOnInit() {
    this.team = team;
  }
}
