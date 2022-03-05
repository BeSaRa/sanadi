import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {CollectionApproval} from "@app/models/collection-approval";
import {CollectionApprovalService} from "@app/services/collection-approval.service";
import {LangService} from '@app/services/lang.service';
import {Observable, of} from 'rxjs';
import {Lookup} from "@app/models/lookup";
import {LookupService} from "@app/services/lookup.service";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {DialogService} from "@app/services/dialog.service";
import {filter, map, takeUntil, tap} from "rxjs/operators";
import {ToastService} from "@app/services/toast.service";


// noinspection AngularMissingOrInvalidDeclarationInModule
@Component({
  selector: 'collection-approval',
  templateUrl: './collection-approval.component.html',
  styleUrls: ['./collection-approval.component.scss']
})
export class CollectionApprovalComponent extends EServicesGenericComponent<CollectionApproval, CollectionApprovalService> {
  constructor(public lang: LangService,
              private lookupService: LookupService,
              private dialog: DialogService,
              private toast: ToastService,
              public service: CollectionApprovalService,
              public fb: FormBuilder) {
    super();
  }

  requestTypes: Lookup[] = this.lookupService.listByCategory.ServiceRequestTypeNoRenew
    .filter((l) => l.lookupKey !== ServiceRequestTypes.EXTEND)
    .sort((a, b) => a.lookupKey - b.lookupKey);

  requestClassifications: Lookup[] = this.lookupService.listByCategory.CollectionClassification;
  licenseDurationTypes: Lookup[] = this.lookupService.listByCategory.LicenseDurationType;
  form!: FormGroup;

  disableSearchField: boolean = true;

  get basicInfo(): FormGroup {
    return this.form.get('basicInfo')! as FormGroup;
  }

  get requestType(): AbstractControl {
    return this.form.get('basicInfo.requestType')!;
  }

  get specialExplanation(): FormGroup {
    return this.form.get('explanation')! as FormGroup;
  }

  _getNewInstance(): CollectionApproval {
    return new CollectionApproval()
  }

  _initComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _buildForm(): void {
    // 1 - implement all model properties [done]
    const model = new CollectionApproval()
    // 2 - create the form controls for the model
    this.form = this.fb.group({
      basicInfo: this.fb.group(model.buildBasicInfo(true)),
      explanation: this.fb.group(model.buildExplanation(true))
    })
    // 3 - draw the screen controls
  }

  _afterBuildForm(): void {
    this.setDefaultValues();
    this.listenToRequestTypeChanges()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap(valid => !valid && this.invalidFormMessage()))
      .pipe(filter(valid => valid))
      .pipe(map(_ => !!(this.model && this.model.collectionItemList.length)))
      .pipe(tap(hasCollectionItems => !hasCollectionItems && this.invalidItemMessage()))
  }

  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.collectionItemList.length) {
      this.invalidItemMessage();
    }
    return true
  }

  private invalidItemMessage() {
    this.dialog.error(this.lang.map.please_add_collection_items_to_proceed)
  }

  _afterLaunch(): void {
    this._resetForm();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }

  _prepareModel(): CollectionApproval | Observable<CollectionApproval> {
    return new CollectionApproval().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    })
  }

  _afterSave(model: CollectionApproval, saveType: SaveTypes, operation: OperationTypes): void {
    // throw new Error('Method not implemented.');
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
    // throw new Error('Method not implemented.');
    console.log(error);
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: CollectionApproval | undefined): void {
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
    this.model && (this.model.collectionItemList = [])
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
  }

  private setDefaultValues(): void {
    if (this.operation === OperationTypes.CREATE) {
      this.requestType.patchValue(this.requestTypes[0].lookupKey);
    }
  }

  private listenToRequestTypeChanges() {
    this.requestType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val: ServiceRequestTypes) => {
        this.disableSearchField = val === ServiceRequestTypes.NEW
      })
  }

  checkDisableRequestType(): void {
    this.model?.collectionItemList.length ? this.requestType.disable() : this.requestType.enable();
  }

  collectionItemFormStatusChanged($event: boolean) {
    $event ? this.requestType.disable() : this.checkDisableRequestType();
  }

  private invalidFormMessage() {
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
}
