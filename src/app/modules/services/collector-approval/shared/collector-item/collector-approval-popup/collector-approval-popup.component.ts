import { CollectorItem } from '@app/models/collector-item';
import { CollectorApproval } from '@app/models/collector-approval';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { LangService } from '@app/services/lang.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DialogService } from '@app/services/dialog.service';
import { LicenseService } from '@app/services/license.service';
import { Observable, Subject } from 'rxjs';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { DateUtils } from '@app/helpers/date-utils';
import { CollectorLicense } from '@app/license-models/collector-license';
import { exhaustMap, filter, map, takeUntil, tap } from 'rxjs/operators';
import { SelectedLicenseInfo } from '@app/interfaces/selected-license-info';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { IKeyValue } from '@app/interfaces/i-key-value';
import { Lookup } from '@app/models/lookup';
import { LookupService } from '@app/services/lookup.service';

@Component({
  selector: 'app-collector-approval-popup',
  templateUrl: './collector-approval-popup.component.html',
  styleUrls: ['./collector-approval-popup.component.scss']
})
export class CollectorApprovalPopupComponent implements OnInit {
  private displayedColumns: string[] = ['fullSerial', 'status', 'requestTypeInfo', 'licenseDurationTypeInfo', 'actions'];
  genders: Lookup[] = this.lookupService.listByCategory.Gender;
  nationalities: Lookup[] = this.lookupService.listByCategory.Nationality;
  relationships: Lookup[] = this.lookupService.listByCategory.CollectorRelation;
  collectorTypes: Lookup[] = this.lookupService.listByCategory.CollectorType;
  oldLicenseFullSerialControl: UntypedFormControl = new UntypedFormControl();
  item!: CollectorItem;
  model: CollectorApproval;
  form: UntypedFormGroup;
  readOnly: boolean;
  viewOnly: boolean;
  editIndex: number;
  licenseDurationType: number | undefined;
  destroy$: Subject<any> = new Subject<any>();
  datepickerOptionsMap: IKeyValue = {
    licenseEndDate: DateUtils.getDatepickerOptions({ disablePeriod: 'none' })
  };
  isPermanent: boolean;
  licenseSearch$: Subject<string> = new Subject<string>();
  constructor(
    @Inject(DIALOG_DATA_TOKEN)
    public data: {
      form: UntypedFormGroup,
      readOnly: boolean,
      viewOnly: boolean,
      editIndex: number,
      item: CollectorItem,
      model: CollectorApproval,
      licenseDurationType: number | undefined,
      isPermanent: boolean
    },
    public lang: LangService,
    private lookupService: LookupService,
    private dialogRef: DialogRef,
    private dialog: DialogService,
    private licenseService: LicenseService
  ) {
    this.form = data.form;
    this.readOnly = data.readOnly;
    this.viewOnly = data.viewOnly;
    this.editIndex = data.editIndex;
    this.item = data.item;
    this.model = data.model;
    this.licenseDurationType = data.licenseDurationType;
    this.isPermanent = data.isPermanent;
  }

  ngOnInit() {
    this.listenToLicenseSearch();
    this.updateForm(this.item);
  }

  searchForLicense() {
    this.licenseSearch$.next(this.oldLicenseFullSerialField.value);
  }

  get oldLicenseFullSerialField(): UntypedFormControl {
    return (this.form.get('oldLicenseFullSerial')) as UntypedFormControl;
  }
  private openSelectLicense(licenses: CollectorLicense[]) {
    const licensesByDurationType = licenses.filter(l => l.licenseDurationTypeInfo.lookupKey == this.licenseDurationType);
    return this.licenseService.openSelectLicenseDialog(licensesByDurationType, this.model, true, this.displayedColumns).onAfterClose$ as Observable<{ selected: CollectorLicense, details: CollectorLicense }>;
  }

  private listenToLicenseSearch(): void {
    this.licenseSearch$
      .pipe(takeUntil(this.destroy$))
      .pipe(exhaustMap((serial) => {
        return this.licenseService
          .collectorSearch<CollectorApproval>({
            fullSerial: serial,
            licenseDurationType: this.model.licenseDurationType
          });
      }))
      .pipe(tap(licenses => !licenses.length && this.dialog.info(this.lang.map.no_result_for_your_search_criteria)))
      .pipe(filter(licenses => !!licenses.length))
      .pipe(exhaustMap((licenses) => {
        return licenses.length === 1 ? this.validateSingleLicense(licenses[0]) : this.openSelectLicense(licenses);
      }))
      .pipe(
        filter<null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>, SelectedLicenseInfo<CollectorLicense, CollectorLicense>>
          ((info): info is SelectedLicenseInfo<CollectorLicense, CollectorLicense> => !!info))
      .pipe(filter((license) => {
        let isAlreadyAdded = this.isLicenseAlreadyAdded(license.details);
        if (isAlreadyAdded) {
          this.dialog.info(this.lang.map.x_already_exists.change({ x: this.lang.map.license }));
        }
        return !isAlreadyAdded;
      }))
      .subscribe((_info) => {
        this.updateForm(this.item = _info.details.convertToItem());
      });
  }

  isLicenseAlreadyAdded(selectedLicense: any): boolean {
    return this.model.collectorItemList.some(x => x.oldLicenseFullSerial === selectedLicense.fullSerial);
  }

  private validateSingleLicense(license: CollectorLicense): Observable<null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>> {
    return this.licenseService.validateLicenseByRequestType<CollectorLicense>(this.model.caseType, this.model.requestType, license.id)
      .pipe(map(validated => {
        return (validated ? {
          selected: validated,
          details: validated
        } : null) as (null | SelectedLicenseInfo<CollectorLicense, CollectorLicense>);
      }));
  }
  isCancelRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.CANCEL);
  }
  isNewRequestType(): boolean {
    return !!this.model && !!this.model.requestType && (this.model.requestType === CollectionRequestType.NEW);
  }
  private updateForm(model: CollectorItem): void {
    this.form.patchValue(model.buildForm(false));
  }
  isEditLicenseEndDateDisabled(): boolean {
    return (this.isPermanent || !this.isNewRequestType() || this.readOnly || this.viewOnly);
  }

  get licenseEndDate() {
    return this.form?.get('licenseEndDate');
  }
  isSearchAllowed(): boolean {
    // if readonly or no request type or request type = new, edit is not allowed
    // if new or draft record, edit is allowed
    // if collection item is new, edit is allowed
    let isAllowed = false;
    if (this.readOnly || this.viewOnly || !this.model.requestType || this.model.requestType === CollectionRequestType.NEW) {
      isAllowed = false;
    } else if (!this.model?.id || (!!this.model?.id && this.model.canCommit()) || !this.item!.itemId) {
      isAllowed = true;
    }
    !isAllowed ? this.oldLicenseFullSerialField.disable() : this.oldLicenseFullSerialField.enable()
    return isAllowed;
  }
  cancel() {
    this.dialogRef.close(null)
  }
  save() {
    this.dialogRef.close(true);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
