import { ComponentType } from '@angular/cdk/portal';
import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { CharityBranch } from '@models/charity-branch';
import { LangService } from '@services/lang.service';
import { CharityBranchPopupComponent } from './charity-branch-popup/charity-branch-popup.component';

@Component({
  selector: 'charity-branch',
  templateUrl: './charity-branch.component.html',
  styleUrls: ['./charity-branch.component.scss'],
})
export class CharityBranchComponent extends ListModelComponent<CharityBranch> {
  @Input() readonly!: boolean;
  @Input() set list(_list: CharityBranch[]) {
    this._list = _list;
  }
  get list(): CharityBranch[] {
    return [...this._list];
  }
  filterControl: UntypedFormControl = new UntypedFormControl('');
  columns = [
    'fullName',
    'address',
    'streetNumber',
    'zoneNumber',
    'buildingNumber',
    'actions'
  ];
  constructor(
    public lang: LangService,
    private fb: UntypedFormBuilder) {
    super(CharityBranch);
  }
  _initComponent(): void {
    const model = new CharityBranch();
    this.model = model;
    this.form = this.fb.group(model.buildForm());
  }
  _getPopupComponent(): ComponentType<any> {
    return CharityBranchPopupComponent;
  }
}
