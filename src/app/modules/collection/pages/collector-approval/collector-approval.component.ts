import {Component} from '@angular/core';
import {CollectorApprovalService} from '@app/services/collector-approval.service';
import {CollectorApproval} from '@app/models/collector-approval';
import {EServicesGenericComponent} from '@app/generics/e-services-generic-component';
import {FormGroup, FormBuilder, AbstractControl} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {LangService} from '@app/services/lang.service';
import {Observable, of} from 'rxjs';
import {Lookup} from '@app/models/lookup';
import {ServiceRequestTypes} from '@app/enums/service-request-types';
import {LookupService} from '@app/services/lookup.service';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {DialogService} from '@app/services/dialog.service';
import {ToastService} from '@app/services/toast.service';

@Component({
  selector: 'collector-approval',
  templateUrl: './collector-approval.component.html',
  styleUrls: ['./collector-approval.component.scss']
})
export class CollectorApprovalComponent extends EServicesGenericComponent<CollectorApproval, CollectorApprovalService> {
  form!: FormGroup;
  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestTypeNoRenew
    .filter((l) => l.lookupKey !== ServiceRequestTypes.EXTEND)
    .sort((a, b) => a.lookupKey - b.lookupKey);

  licenseDurationTypes: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  disableSearchField: boolean = true;

  constructor(public lang: LangService,
              public fb: FormBuilder,
              public service: CollectorApprovalService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService) {
    super();
  }

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
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
    this.listenToRequestTypeChanges()
    this.checkDisableFields();
    this.listenToDurationChanges()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
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
    this._resetForm();
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
    throw new Error('Method not implemented.');
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
    this.model && (this.model.collectorItemList = [])
    this.operation = OperationTypes.CREATE;
  }

  collectorItemFormStatusChanged(event: boolean) {
    event ? this.disableFields() : this.checkDisableFields();
  }

  checkDisableFields(): void {
    this.model?.collectorItemList.length ? this.disableFields() : this.enableFields();
  }

  private listenToRequestTypeChanges() {
    this.requestType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: ServiceRequestTypes) => {
        this.disableSearchField = val === ServiceRequestTypes.NEW
      })
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
}
