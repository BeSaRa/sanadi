import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ImplementingAgency } from '@models/implementing-agency';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { AdminResult } from '@app/models/admin-result';
import { Lookup } from '@app/models/lookup';
import { CommonService } from '@app/services/common.service';
import { LookupService } from '@app/services/lookup.service';

@Component({
  selector: 'app-intervention-implementing-agency-list-popup',
  templateUrl: './intervention-implementing-agency-list-popup.component.html',
  styleUrls: ['./intervention-implementing-agency-list-popup.component.scss']
})
export class InterventionImplementingAgencyListPopupComponent implements OnInit {
  form: UntypedFormGroup;
  readonly: boolean;
  editItem: number;
  model: ImplementingAgency;
  viewOnly: boolean;
  executionCountry: number;
  implementingAgencyTypeList: Lookup[] = this.lookupService.listByCategory.ImplementingAgencyType.slice().sort((a, b) => a.lookupKey - b.lookupKey);
  implementingAgencyList: AdminResult[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN)
  public data: {
    form: UntypedFormGroup,
    readonly: boolean,
    editItem: number,
    model: ImplementingAgency,
    viewOnly: boolean,
    executionCountry: number,
  },
    private lookupService: LookupService,
    private commonService: CommonService,
    public lang: LangService,
    private dialogRef: DialogRef) {
    this.form = data.form;
    this.readonly = data.readonly;
    this.editItem = data.editItem;
    this.model = data.model;
    this.viewOnly = data.viewOnly;
    this.executionCountry = data.executionCountry;
  }

  ngOnInit() {
    this.form.patchValue(this.model);
    this.loadImplementingAgenciesByAgencyType(this.form.value.implementingAgencyType);
  }
  handleImplementingAgencyTypeChange(agencyType: number, userInteraction: boolean = false): void {
    if (userInteraction) {
      this.implementingAgencyField.setValue(null);
      this.loadImplementingAgenciesByAgencyType(agencyType);
    }
  }

  private loadImplementingAgenciesByAgencyType(agencyType: number) {
    if (!agencyType) {
      this.implementingAgencyList = [];
      return;
    }
    this.commonService.loadAgenciesByAgencyTypeAndCountry(agencyType, this.executionCountry)
      .subscribe((result) => {
        this.implementingAgencyList = result;
      });
  }

  get implementingAgencyTypeField(): UntypedFormControl {
    return this.form.get('implementingAgencyType') as UntypedFormControl;
  }

  get implementingAgencyField(): UntypedFormControl {
    return this.form.get('implementingAgency') as UntypedFormControl;
  }
  mapFormTo(form: any): ImplementingAgency {
    let agencyTypeInfo: AdminResult = (this.implementingAgencyTypeList.find(x => x.lookupKey === form.implementingAgencyType) ?? new Lookup()).convertToAdminResult();
    let agencyInfo: AdminResult = (this.implementingAgencyList.find(x => x.fnId === form.implementingAgency)) ?? new AdminResult();

    return (new ImplementingAgency()).clone({
      ...this.model, ...form,
      agencyTypeInfo: agencyTypeInfo,
      implementingAgencyInfo: agencyInfo
    });
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

}
