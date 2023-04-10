import {Component, Input, ViewChild} from '@angular/core';
import {UntypedFormBuilder} from '@angular/forms';
import {ListModelComponent} from '@app/generics/ListModel-component';
import {ControlWrapper} from '@contracts/i-control-wrapper';
import {CharityBranch} from '@models/charity-branch';
import {OrganizationOfficerComponent} from '@modules/services/coordination-with-organization-request/shared/organization-officer/organization-officer.component';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {Lookup} from '@models/lookup';

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
  @ViewChild('org_officers') org!: OrganizationOfficerComponent;
  get list(): CharityBranch[] {
    return [...this._list];
  }
  columns = [
    'fullName',
    'address',
    'streetNumber',
    'zoneNumber',
    'buildingNumber',
    'actions'
  ];
  controls: ControlWrapper[] = [
    { controlName: 'fullName', type: 'text', label: this.lang.map.full_name },
    {
      controlName: 'category',
      label: this.lang.map.type,
      load: this.lookupService.listByCategory.BranchCategory,
      type: 'dropdown',
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'branchAdjective',
      label: this.lang.map.branch_adjective,
      load: this.lookupService.listByCategory.BranchAdjective,
      type: 'dropdown',
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'usageAdjective',
      label: this.lang.map.usage_adjective,
      load: this.lookupService.listByCategory.UsageAdjective,
      type: 'dropdown',
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    { controlName: 'address', label: this.lang.map.lbl_address, type: 'text' },
    { controlName: 'streetNumber', label: this.lang.map.lbl_street, type: 'text' },
    { controlName: 'buildingNumber', label: this.lang.map.building_number, type: 'text' },
    { controlName: 'zoneNumber', label: this.lang.map.lbl_zone, type: 'text' },
  ];

  constructor(
    public lang: LangService,
    private lookupService: LookupService,
    private fb: UntypedFormBuilder) {
    super(CharityBranch);
  }
  _initComponent(): void {
    const model = new CharityBranch();
    this.model = model;
    this.form = this.fb.group(model.buildForm());
  }
  _beforeAdd(model: CharityBranch): CharityBranch | null {
    model.branchContactOfficer = this.org.list;
    return model;
  }
}
