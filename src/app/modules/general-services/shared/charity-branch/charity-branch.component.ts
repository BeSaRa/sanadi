import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { CharityBranch } from '@app/models/charity-branch';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
  columns = [
    'fullName',
    'address',
    'streetNumber',
    'zoneNumber',
    'buildingNumber',
  ];
  controls: ControlWrapper[] = [
    { controlName: 'fullName', type: 'text', label: this.lang.map.full_name },
    {
      controlName: 'category',
      label: this.lang.map.type,
      load: this.lookupService.listByCategory.BranchCategory,
      type: 'dropdown'
    },
    {
      controlName: 'branchAdjective',
      label: this.lang.map.branch_adjective,
      load: this.lookupService.listByCategory.BranchAdjective,
      type: 'dropdown'
    },
    {
      controlName: 'usageAdjective',
      label: this.lang.map.usage_adjective,
      load: this.lookupService.listByCategory.UsageAdjective,
      type: 'dropdown'
    },
    { controlName: 'address', label: this.lang.map.lbl_address, type: 'text' },
    { controlName: 'streetNumber', label: this.lang.map.lbl_street, type: 'text' },
    { controlName: 'buildingNumber', label: this.lang.map.building_number, type: 'text' },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone, type: 'text' },
  ];

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private fb: UntypedFormBuilder
  ) {
    super(CharityBranch);
  }
  _initComponent(): void {
    const model = new CharityBranch();
    this.model = model;
    this.form = this.fb.group(model.buildForm());
  }

}
