import { Component, Input } from '@angular/core';
import { team } from '@data/teammates';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { Teammate } from '@models/types';

@Component({
  selector: 'app-teammate-card',
  imports: [MatTooltip, MatIconButton, MatDivider],
  templateUrl: './teammate-card.component.html',
  styleUrl: './teammate-card.component.scss',
})
export class TeammateCardComponent {
  @Input({ required: true }) public teammate!: Teammate;
  protected readonly team = team;
}
