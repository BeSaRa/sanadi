import {Component, Input} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {CharityReport} from '@models/charity-report';
import {LangService} from '@services/lang.service';
import {ToastService} from '@services/toast.service';
import { ComponentType } from '@angular/cdk/portal';
import { CharityReportsPopupComponent } from './charity-reports-popup/charity-reports-popup.component';

@Component({
  selector: 'charity-reports',
  templateUrl: './charity-reports.component.html',
  styleUrls: ['./charity-reports.component.scss'],
})
export class CharityReportsComponent extends ListModelComponent<CharityReport> {
  protected _getPopupComponent(): ComponentType<any> {
    return CharityReportsPopupComponent;
  }
  get list() {
    return this._list;
  }

  @Input() set list(_list: CharityReport[]) {
    this._list = _list;
  }

  @Input() readonly!: boolean;
  @Input() pageTitle!: keyof ILanguageKeys;
  form!: UntypedFormGroup;
  columns = [
    'fullName',
    'generalDate',
    'feedback',
    'reportStatus',
    'actions',
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public lang: LangService,
    private toastr: ToastService
  ) {
    super(CharityReport);
  }

  _beforeAdd(model: CharityReport): CharityReport | null {
    if (
      this._list.findIndex((e) => e.fullName === model.fullName) !== -1 &&
      this.editRecordIndex === -1
    ) {
      this.toastr.alert(this.lang.map.msg_duplicated_item);
      return null;
    }
    return model;
  }

  protected _initComponent(): void {
    this.customData = {
      pageTitle: this.pageTitle
    }

    if (this.pageTitle === 'risk_reports') {
      this.form = this.fb.group(this.model.buildRiskForm());
    } else if (this.pageTitle === 'coordination_and_support_reports') {
      this.form = this.fb.group(this.model.buildSupportForm());
    } else {
      this.form = this.fb.group(this.model.buildFormWithSubject());
    }
  }
}
