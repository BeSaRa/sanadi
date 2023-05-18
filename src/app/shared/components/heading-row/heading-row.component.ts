import {Component, Input, TemplateRef} from '@angular/core';
import {LangService} from '@services/lang.service';
import {ILanguageKeys} from '@contracts/i-language-keys';

@Component({
  selector: 'heading-row',
  templateUrl: './heading-row.component.html',
  styleUrls: ['./heading-row.component.scss']
})
export class HeadingRowComponent {
  constructor(public lang: LangService) {
  }

  @Input() labelKey: keyof ILanguageKeys = {} as keyof ILanguageKeys;
  @Input() label: string = '';
  @Input() hideHorizontalLine: boolean = false;
  @Input() extraButtonsTemplate?: TemplateRef<any>;
  @Input() removeBottomMargin: boolean = false;

  get headingText(): string {
    if (this.label) {
      return this.label;
    } else {
      return this.lang.map[this.labelKey] ?? '';
    }
  }
}
