import { Component, Inject, OnInit } from '@angular/core';
import { AdminLookupTypeEnum } from '@app/enums/admin-lookup-type-enum';
import { DateUtils } from '@app/helpers/date-utils';
import { ControlWrapper } from '@app/interfaces/i-control-wrapper';
import { AdminLookup } from '@app/models/admin-lookup';
import { AdminLookupService } from '@app/services/admin-lookup.service';
import { LangService } from '@app/services/lang.service';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { UntypedFormGroup } from '@angular/forms';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { CharityDecision } from '@app/models/charity-decision';
import { DatepickerOptionsMap } from '@app/types/types';
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'app-charity-decisions-popup',
  templateUrl: './charity-decisions-popup.component.html',
  styleUrls: ['./charity-decisions-popup.component.scss']
})
export class CharityDecisionsPopupComponent implements OnInit {
  datepickerOptionsMap: DatepickerOptionsMap = {
    generalDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' })
  };

  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  model: CharityDecision;
  controls: ControlWrapper[] = [];
  pageTitle: keyof ILanguageKeys;
  hideFullScreen = true;
  inside: boolean;
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: CharityDecision,
      customData: any,
    },
    private dialogRef: DialogRef,
    public lang: LangService,
    private adminLookupService: AdminLookupService,
    ) {
      this.form = data.form;
      this.hideSave = data.hideSave;
      this.readonly = data.readonly;
      this.editRecordIndex = data.editRecordIndex;
      this.model = data.model;
      this.pageTitle = data.customData.pageTitle;
      this.inside = data.customData.inside;
    }

  ngOnInit() {
    this.controls = [
      {
        controlName: 'referenceNumber',
        langKey: 'decision_reference_number',
        type: 'text',
      },
      {
        controlName: 'generalDate',
        langKey: 'date',
        type: 'date',
      },
      {
        controlName: 'subject',
        langKey: 'subject',
        type: 'text',
      },
      {
        controlName: 'category',
        langKey: 'decision_category',
        type: 'dropdown',
        dropdownValue: 'id',
        load$: this.inside
          ? this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.PENALTIES_DECISION)
          : this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.RESOLUTIONS_ISSUED),
        dropdownOptionDisabled: (optionItem: AdminLookup) => {
          return !optionItem.isActive();
        }
      },
    ];
    if (!this.inside) {
      this.controls.push({
        controlName: 'organization',
        langKey: 'issuer',
        type: 'text'
      });
    }

    this.form.patchValue({
      ...this.model,
      generalDate: DateUtils.changeDateToDatepicker(this.model.generalDate),
    });
  }

  mapFormTo(form: any): CharityDecision {
    const model: CharityDecision = new CharityDecision().clone(form);
    model.generalDate = DateUtils.getDateStringFromDate(model.generalDate!)!;

    return model;
  }

  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
