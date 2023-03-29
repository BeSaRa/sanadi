import { Component, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { CharityBranch } from '@app/models/charity-branch';
import { Lookup } from '@app/models/lookup';
import { OrganizationOfficerComponent } from '@app/modules/services/coordination-with-organization-request/shared/organization-officer/organization-officer.component';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';

@Component({
  selector: 'app-charity-branch-popup',
  templateUrl: './charity-branch-popup.component.html',
  styleUrls: ['./charity-branch-popup.component.scss']
})
export class CharityBranchPopupComponent implements AfterViewInit {
  model!: CharityBranch;
  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
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
  @ViewChild('org_officers') org!: OrganizationOfficerComponent;

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: CharityBranch
    },
    public lang: LangService,
    private dialogRef: DialogRef,
    private lookupService: LookupService
  ) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
  }

  ngAfterViewInit(): void {
    this.org.list = this.model.branchContactOfficerList || this.model.branchContactOfficer;
  }

  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.model.branchContactOfficer = this.org.list;
    this.model.branchContactOfficerList = this.org.list;
    this.dialogRef.close(this.model)
  }
}
