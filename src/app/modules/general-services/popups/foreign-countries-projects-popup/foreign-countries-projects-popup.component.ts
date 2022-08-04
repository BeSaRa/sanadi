import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { WFResponseType } from '@app/enums/wfresponse-type.enum';
import { CommonUtils } from '@app/helpers/common-utils';
import { DateUtils } from '@app/helpers/date-utils';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { ILanguageKeys } from '@app/interfaces/i-language-keys';
import { IWFResponse } from '@app/interfaces/i-w-f-response';
import { ForeignCountriesProjects } from '@app/models/foreign-countries-projects';
import { DialogService } from '@app/services/dialog.service';
import { InboxService } from '@app/services/inbox.service';
import { LangService } from '@app/services/lang.service';
import { OrganizationUnitService } from '@app/services/organization-unit.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { validationPatterns } from '@app/validators/validate-fields-status';
import { Subject } from 'rxjs';
import { exhaustMap, switchMap, takeUntil, filter, tap, map } from 'rxjs/operators';

@Component({
  selector: 'foreign-countries-projects-popup',
  templateUrl: './foreign-countries-projects-popup.component.html',
  styleUrls: ['./foreign-countries-projects-popup.component.scss']
})
export class ForeignCountriesProjectsPopupComponent implements OnInit {

  private destroy$: Subject<any> = new Subject();
  label: keyof ILanguageKeys;
  organizations$ = this.OgranizationsService.load().pipe(map(e => e.filter(x => !x.orgCode?.match(validationPatterns.AR_ONLY))), takeUntil(this.destroy$))
  selectedLicense!: ForeignCountriesProjects | null;

  selectedIndex: number | false = false;
  action$: Subject<any> = new Subject<any>();

  response: WFResponseType = WFResponseType.APPROVE;

  model: ForeignCountriesProjects;
  comment: FormControl = new FormControl();
  followUpDate: FormControl = new FormControl();
  organizationId: FormControl = new FormControl();
  datepickerOptionsMap: IKeyValue = {
    followUpDate: DateUtils.getDatepickerOptions({ disablePeriod: 'past' })
  };

  constructor(
    private dialog: DialogService,
    private dialogRef: DialogRef,
    private toast: ToastService,
    private inboxService: InboxService,
    @Inject(DIALOG_DATA_TOKEN) public data: {
      model: ForeignCountriesProjects,
      action: WFResponseType
    },
    public lang: LangService,
    private OgranizationsService: OrganizationUnitService
  ) {
    this.label = ((CommonUtils.changeCamelToSnakeCase(this.data.action) + '_task') as unknown as keyof ILanguageKeys);
    this.response = this.data.action;
    this.model = this.data.model;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {
    this.selectedLicense = this.model;
    this.followUpDate.patchValue(DateUtils.changeDateToDatepicker(this.model.followUpDate));

    this.listenToAction();
  }
  saveLicenseInfo(license: ForeignCountriesProjects) {
    this.model.followUpDate = license.followUpDate;
    this.model.organizationId = license.organizationId;
  }

  formCancel() {
    this.selectedLicense = null;
    this.selectedIndex = false;
  }

  private listenToAction() {
    this.action$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(invalid => invalid && this.displayInvalidItemMessages()))
      .pipe(filter(invalid => !invalid))
      .pipe(exhaustMap(_ => {
        this.model.followUpDate = DateUtils.getDateStringFromDate(this.followUpDate.value);
        this.model.organizationId = this.organizationId.value;
        return this.model.save();
      }))
      .pipe(switchMap(_ => this.inboxService.takeActionOnTask(this.data.model.taskDetails.tkiid, this.getResponse(), this.model.service)))
      .subscribe(() => {
        this.toast.success(this.lang.map.process_has_been_done_successfully);
        this.dialogRef.close(true);
      })
  }

  private displayInvalidItemMessages() {
    this.dialog.error(this.lang.map.please_make_sure_that_you_filled_out_all_required_data_for_all_license);
  }

  private getResponse(): Partial<IWFResponse> {
    return this.comment.value ? {
      selectedResponse: this.response,
      comment: this.comment.value
    } : { selectedResponse: this.response };
  }

}
