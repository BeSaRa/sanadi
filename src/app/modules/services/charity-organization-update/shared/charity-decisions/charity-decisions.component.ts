import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@enums/admin-lookup-type-enum';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {DateUtils} from '@helpers/date-utils';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CharityDecision} from '@models/charity-decision';
import {AdminLookupService} from '@services/admin-lookup.service';
import {LangService} from '@services/lang.service';
import {DatepickerOptionsMap} from '@app/types/types';
import {AdminLookup} from '@models/admin-lookup';
import { ComponentType } from '@angular/cdk/portal';
import { CharityDecisionsPopupComponent } from './charity-decisions-popup/charity-decisions-popup.component';

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
