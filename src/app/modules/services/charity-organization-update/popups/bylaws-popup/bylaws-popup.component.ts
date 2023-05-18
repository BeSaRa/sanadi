import {LangService} from '@services/lang.service';
import {Component, Inject, OnInit} from '@angular/core';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {AdminLookupService} from '@app/services/admin-lookup.service';
import {share} from 'rxjs/operators';
import {AdminLookup} from '@app/models/admin-lookup';
import {ControlWrapper} from '@app/interfaces/i-control-wrapper';
import {DateUtils} from '@app/helpers/date-utils';
import {DatepickerOptionsMap} from '@app/types/types';
import {Bylaw} from '@app/models/bylaw';
import {UntypedFormGroup} from '@angular/forms';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {AdminResult} from '@app/models/admin-result';
import {CommonUtils} from "@helpers/common-utils";

@Component({
  selector: 'app-bylaws-popup',
  templateUrl: './bylaws-popup.component.html',
  styleUrls: ['./bylaws-popup.component.scss']
})
export class BylawsPopupComponent implements OnInit {
  datepickerOptionsMap: DatepickerOptionsMap = {
    firstReleaseDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'}),
    lastUpdateDate: DateUtils.getDatepickerOptions({disablePeriod: 'future'})
  };
  classifications!: AdminLookup[];
  controls: ControlWrapper[] = [];
  hideFullScreen = true;

  form: UntypedFormGroup;
  readonly: boolean;
  hideSave: boolean;
  editRecordIndex: number;
  model: Bylaw;

  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readonly: boolean,
      hideSave: boolean,
      editRecordIndex: number,
      model: Bylaw,
      customData: any,
    },
    private dialogRef: DialogRef,
    private adminLookupService: AdminLookupService, public lang: LangService) {
    this.form = data.form;
    this.hideSave = data.hideSave;
    this.readonly = data.readonly;
    this.editRecordIndex = data.editRecordIndex;
    this.model = data.model;
  }

  ngOnInit() {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.BYLAWS_CLASSIFICATION)
      .pipe(share())
      .subscribe(result => {
        this.classifications = result;
        this.controls = [
          {
            controlName: 'fullName',
            langKey: 'bylaw_name',
            type: 'text'
          },
          {
            controlName: 'firstReleaseDate',
            langKey: 'first_realase_date',
            type: 'date'
          },
          {
            controlName: 'lastUpdateDate',
            langKey: 'date_of_last_update',
            type: 'date'
          },
          {
            controlName: 'category',
            langKey: 'classification',
            type: 'dropdown',
            load: result,
            dropdownValue: 'id',
            dropdownOptionDisabled: (optionItem: AdminLookup) => {
              return !optionItem.isActive();
            }
          }
        ];
      });

    const row = {...this.model};
    row.firstReleaseDate = DateUtils.changeDateToDatepicker(row.firstReleaseDate);
    row.lastUpdateDate = DateUtils.changeDateToDatepicker(row.lastUpdateDate);
    this.form.patchValue(row);
  }

  mapFormTo(form: any): Bylaw {
    const model: Bylaw = new Bylaw().clone(form);
    model.lastUpdateDate = DateUtils.getDateStringFromDate(form.lastUpdateDate);
    model.firstReleaseDate = DateUtils.getDateStringFromDate(form.firstReleaseDate);
    model.categoryInfo = AdminResult.createInstance(({
      ...this.classifications.find(e => e.id === form.category)
    }));
    return model;
  }

  save() {
    this.dialogRef.close(this.mapFormTo(this.form.getRawValue()))
  }

  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    CommonUtils.displayFormValidity((form || this.form), element);
  }
}
