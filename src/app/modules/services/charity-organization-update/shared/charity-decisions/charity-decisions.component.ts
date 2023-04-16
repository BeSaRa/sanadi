import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CharityDecision} from '@models/charity-decision';
import {LangService} from '@services/lang.service';
import { ComponentType } from '@angular/cdk/portal';
import { CharityDecisionsPopupComponent } from '../../popups/charity-decisions-popup/charity-decisions-popup.component';

@Component({
  selector: 'charity-decisions',
  templateUrl: './charity-decisions.component.html',
  styleUrls: ['./charity-decisions.component.scss'],
})
export class CharityDecisionsComponent extends ListModelComponent<CharityDecision> {
  protected _getPopupComponent(): ComponentType<any> {
    return CharityDecisionsPopupComponent;
  }
  get list() {
    return this._list;
  }
  @Input() set list(_list: CharityDecision[]) {
    this._list = _list;
  }
  @Input() readonly!: boolean;
  @Input() pageTitle!: keyof ILanguageKeys;
  @Input() inside = false;
  form!: UntypedFormGroup;

  columns = ['referenceNumber', 'generalDate', 'subject', 'actions'];
  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService
  ) {
    super(CharityDecision);
  }

  protected _initComponent(): void {
    this.customData = {
      pageTitle: this.pageTitle,
      inside: this.inside
    }
    this.form = this.fb.group(this.model.buildForm(true, !this.inside));
  }
}
