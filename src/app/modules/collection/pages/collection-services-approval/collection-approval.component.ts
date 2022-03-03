import {Component} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {CollectionApproval} from "@app/models/collection-approval";
import {CollectionApprovalService} from "@app/services/collection-approval.service";
import {LangService} from '@app/services/lang.service';
import {Observable} from 'rxjs';
import {Lookup} from "@app/models/lookup";
import {LookupService} from "@app/services/lookup.service";
import {ServiceRequestTypes} from "@app/enums/service-request-types";
import {DialogService} from "@app/services/dialog.service";
import {takeUntil} from "rxjs/operators";


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

  get requestType(): AbstractControl {
    return this.form.get('requestType')!
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
    this.form = this.fb.group(model.buildForm(true))
    // 3 - draw the screen controls
  }

  _afterBuildForm(): void {
    this.setDefaultValues();
    this.listenToRequestTypeChanges()
  }

  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    // throw new Error('Method not implemented.');
    // check the validation
    // there is no items
    this.dialog.error('Please Fill the required data');
    return false

  }

  _beforeLaunch(): boolean | Observable<boolean> {
    throw new Error('Method not implemented.');
  }

  _afterLaunch(): void {
    throw new Error('Method not implemented.');
  }

  _prepareModel(): CollectionApproval | Observable<CollectionApproval> {
    return new CollectionApproval().clone({
      ...this.form.value
    })
  }

  _afterSave(model: CollectionApproval, saveType: SaveTypes, operation: OperationTypes): void {
    // throw new Error('Method not implemented.');
  }

  _saveFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _launchFail(error: any): void {
    throw new Error('Method not implemented.');
  }

  _destroyComponent(): void {
    // throw new Error('Method not implemented.');
  }

  _updateForm(model: CollectionApproval | undefined): void {
    throw new Error('Method not implemented.');
  }

  _resetForm(): void {
    console.log('RESET');
    // throw new Error('Method not implemented.');
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
}
