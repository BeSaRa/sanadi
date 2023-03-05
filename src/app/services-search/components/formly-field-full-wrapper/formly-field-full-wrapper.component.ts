import {Component, OnInit} from '@angular/core';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { LangService } from '@app/services/lang.service';
import {FieldWrapper} from '@ngx-formly/core';

@Component({
  selector: 'formly-field-full-wrapper',
  templateUrl: './formly-field-full-wrapper.component.html',
  styleUrls: ['./formly-field-full-wrapper.component.scss']
})
export class FormlyFieldFullWrapperComponent extends FieldWrapper implements OnInit {
  public labelKey!: keyof ILanguageKeys;

  constructor(public lang: LangService) {
    super();
  }

  ngOnInit(): void {
    this.labelKey = (this.to.label as unknown as keyof ILanguageKeys);
  }

}
