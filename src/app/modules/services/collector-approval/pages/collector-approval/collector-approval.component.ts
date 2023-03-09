import {Component, ViewChild} from '@angular/core';
import {CollectorApprovalService} from '@services/collector-approval.service';
import {CollectorApproval} from '@models/collector-approval';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {AbstractControl, UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@enums/operation-types.enum';
import {SaveTypes} from '@enums/save-types';
import {LangService} from '@services/lang.service';
import {Observable, of} from 'rxjs';
import {Lookup} from '@models/lookup';
import {CollectionRequestType} from '@enums/service-request-types';
import {LookupService} from '@services/lookup.service';
import {filter, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {OpenFrom} from '@enums/open-from.enum';
import {EmployeeService} from '@services/employee.service';
import {CommonCaseStatus} from '@enums/common-case-status.enum';
import {UserClickOn} from '@enums/user-click-on.enum';
import {
  CollectorItemComponent
} from '@modules/services/collector-approval/shared/collector-item/collector-item.component';

@Component({
  selector: 'collector-approval',
  templateUrl: './collector-approval.component.html',
  styleUrls: ['./collector-approval.component.scss']
})
export class CollectorApprovalComponent extends EServicesGenericComponent<CollectorApproval, CollectorApprovalService> {
  form!: UntypedFormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.CollectionRequestType
    .sort((a, b) => a.lookupKey - b.lookupKey);

  licenseDurationTypes: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  disableSearchField: boolean = true;
  @ViewChild('nested_collector') nestedCollector!: CollectorItemComponent

  formProperties = {
    requestType: () => {
      return this.getObservableField('requestType')
    }
  }

  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              public service: CollectorApprovalService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private employeeService: EmployeeService,
              private toast: ToastService) {
    super();
  }

  get basicInfo(): UntypedFormGroup {
    return this.form.get('basicInfo')! as UntypedFormGroup;
  }

  get specialExplanation(): UntypedFormGroup {
    return this.form.get('explanation')! as UntypedFormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basicInfo.requestType')!;
  }

  get licenseDurationType(): AbstractControl {
    return this.form.get('basicInfo.licenseDurationType')!
  }

  _getNewInstance(): CollectorApproval {
    return new CollectorApproval();
  }

  _initComponent(): void {

  }

  _buildForm(): void {
    const model = new CollectorApproval();
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    });
  }

  _afterBuildForm(): void {
    this.checkDisableFields();
    this.listenToDurationChanges();
    this.handleReadonly();
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    if (!this.requestType.value) {
      this.dialog.error(this.lang.map.msg_please_select_x_to_continue.change({x: this.lang.map.request_type}));
      return false;
    }
    if (saveType === SaveTypes.DRAFT) {
      return true;
    }
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(map(_ => !!(this.model && this.model.collectorItemList.length)))
      .pipe(tap(hasCollectionItems => !hasCollectionItems && this.invalidItemMessage()))
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.collectorItemList.length) {
      this.invalidItemMessage();
    }
    return true;
  }

  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): CollectorApproval | Observable<CollectorApproval> {
    return new CollectorApproval().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    })
  }

  _afterSave(model: CollectorApproval, saveType: SaveTypes, operation: OperationTypes): void {
    this.model = model;
    if (
      (operation === OperationTypes.CREATE && saveType === SaveTypes.FINAL) ||
      (operation === OperationTypes.UPDATE && saveType === SaveTypes.COMMIT)
    ) {
      this.dialog.success(this.lang.map.msg_request_has_been_added_successfully.change({serial: model.fullSerial}));
    } else {
      this.toast.success(this.lang.map.request_has_been_saved_successfully);
    }
  }

  _saveFail(error: any): void {
    console.error(error);
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {

  }

  _updateForm(model: CollectorApproval | undefined): void {
    if (!model) {
      return;
    }
    this.model = model;
    this.form.patchValue({
      basicInfo: model?.buildBasicInfo(),
      explanation: model?.buildExplanation()
    })
  }

  _resetForm(): void {
    this.form.reset();
    this.disableSearchField = true;
    this.nestedCollector.cancel();
    this.model && (this.model.collectorItemList = [])
    this.operation = OperationTypes.CREATE;
  }

  collectorItemFormStatusChanged(event: boolean) {
    event ? this.disableFields() : this.checkDisableFields();
  }

  checkDisableFields(): void {
    this.model?.collectorItemList.length ? this.disableFields() : this.enableFields();
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false): void {
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        if (userInteraction) {
          this.resetForm$.next();
          this.requestType.setValue(requestTypeValue);
        }

        this.disableSearchField = requestTypeValue === CollectionRequestType.NEW;
        this.model!.requestType = requestTypeValue;

        this.requestType$.next(requestTypeValue);
      } else {
        this.requestType.setValue(this.requestType$.value);
      }
    });
  }

  private listenToDurationChanges() {
    this.licenseDurationType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.model && (this.model.licenseDurationType = value);
      })
  }

  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_collector_items_to_proceed)
  }

  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }

  private disableFields() {
    this.requestType.disable();
    this.licenseDurationType.disable();
  }

  private enableFields(): void {
    this.requestType.enable();
    this.licenseDurationType.enable();
  }

  isEditRequestTypeAllowed(): boolean {
    // allow edit if new record or saved as draft
    return !this.model?.id || (!!this.model?.id && this.model.canCommit());
  }

  handleReadonly(): void {
    // if record is new, no readonly (don't change as default is readonly = false)
    if (!this.model?.id) {
      return;
    }

    let caseStatus = this.model.getCaseStatus();
    if (caseStatus == CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_REJECTION) {
      this.readonly = true;
      return;
    }

    if (this.openFrom === OpenFrom.USER_INBOX) {
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom === OpenFrom.TEAM_INBOX) {
      // after claim, consider it same as user inbox and use same condition
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH) {
      // if saved as draft and opened by creator who is charity user, then no readonly
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }

  isNewRequestType(): boolean {
    return this.requestType.value && (this.requestType.value === CollectionRequestType.NEW);
  }

  /*isEditLicenseAllowed(): boolean {
    // if new or draft record and request type !== new, edit is allowed
    let isAllowed = !this.model?.id || (!!this.model?.id && this.model.canCommit());
    return isAllowed && CommonUtils.isValidValue(this.requestType.value) && this.requestType.value !== CollectionRequestType.NEW;
  }*/
}
