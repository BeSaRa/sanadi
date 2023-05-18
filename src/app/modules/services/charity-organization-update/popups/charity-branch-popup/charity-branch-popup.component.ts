import {AfterViewInit, Component, Inject, ViewChild} from '@angular/core';
import {UntypedFormGroup} from '@angular/forms';
import {ControlWrapper} from '@app/interfaces/i-control-wrapper';
import {CharityBranch} from '@app/models/charity-branch';
import {Lookup} from '@app/models/lookup';
import {
  OrganizationOfficerComponent
} from '@app/modules/services/coordination-with-organization-request/shared/organization-officer/organization-officer.component';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {CommonUtils} from "@helpers/common-utils";

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
  hideFullScreen = false;
  controls: ControlWrapper[] = [
    {
      controlName: 'fullName',
      type: 'text',
      langKey: 'full_name'
    },
    {
      controlName: 'category',
      langKey: 'type',
      load: this.lookupService.listByCategory.BranchCategory,
      type: 'dropdown',
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'branchAdjective',
      langKey: 'branch_adjective',
      load: this.lookupService.listByCategory.BranchAdjective,
      type: 'dropdown',
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'usageAdjective',
      langKey: 'usage_adjective',
      load: this.lookupService.listByCategory.UsageAdjective,
      type: 'dropdown',
      dropdownValue: 'lookupKey',
      dropdownOptionDisabled: (optionItem: Lookup) => {
        return !optionItem.isActive();
      }
    },
    {
      controlName: 'address',
      langKey: 'lbl_address',
      type: 'text'
    },
    {
      controlName: 'streetNumber',
      langKey: 'lbl_street',
      type: 'text'
    },
    {
      controlName: 'buildingNumber',
      langKey: 'building_number',
      type: 'text'
    },
    {
      controlName: 'zoneNumber',
      langKey: 'lbl_zone',
      type: 'text'
    },
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

  mapFormTo(form: any): CharityBranch {
    const branch: CharityBranch = new CharityBranch().clone(form);
    branch.branchContactOfficer = this.org.list;
    branch.branchContactOfficerList = this.org.list;

    return branch;
  }

  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
