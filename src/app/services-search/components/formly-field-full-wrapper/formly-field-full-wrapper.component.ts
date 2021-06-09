import {Component, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {FieldWrapper} from '@ngx-formly/core';
import {ILanguageKeys} from '../../../interfaces/i-language-keys';

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
