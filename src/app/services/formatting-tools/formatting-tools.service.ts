import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormattingToolsService {
  public slugify(text: string): string {
    void this;
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  }
}
