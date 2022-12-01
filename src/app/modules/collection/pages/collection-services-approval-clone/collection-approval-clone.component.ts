import { Component } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { SaveTypes } from '@app/enums/save-types';
import { EServicesGenericComponent } from '@app/generics/e-services-generic-component';
import { CollectionApprovalClone } from '@app/models/collection-approval-clone';
import { CollectionApprovalCloneService } from '@app/services/collection-approval-clone.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { Observable, of } from 'rxjs';
import { EmployeeService } from '@app/services/employee.service';
import { DialogService } from '@app/services/dialog.service';
import { Lookup } from '@app/models/lookup';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { CollectionRequestType } from '@app/enums/service-request-types';
import { CommonCaseStatus } from '@app/enums/common-case-status.enum';
import { OpenFrom } from '@app/enums/open-from.enum';
import { ToastService } from '@app/services/toast.service';

@Component({
  selector: 'collection-approval-clone',
  templateUrl: './collection-approval-clone.component.html',
  styleUrls: ['./collection-approval-clone.component.scss']
})
export class CollectionApprovalCloneComponent extends EServicesGenericComponent<CollectionApprovalClone, CollectionApprovalCloneService>  {
  constructor(
    public lang: LangService, 
    public service: CollectionApprovalCloneService,
    public fb: UntypedFormBuilder,
    public lookupService:LookupService,
    public employeeService:EmployeeService,
    private dialog: DialogService,
    private toast:ToastService
    ) {
    super();
  }
    
  requestTypes:Lookup[]=this.lookupService.listByCategory.CollectionRequestType
  requestClassifications:Lookup[]= this.lookupService.listByCategory.CollectionClassification
  licenseDurationTypes:Lookup[]= this.lookupService.listByCategory.LicenseDurationType;
  disableSearchField:boolean=true
  form!: UntypedFormGroup;

  formProperties = {
    requestType:()=>{
      return this.getObservableField('requestType')
    }
  };

  _getNewInstance(): CollectionApprovalClone {
    return new CollectionApprovalClone();
  }
  _initComponent(): void {
  }
  _buildForm(): void {
    const modal = new CollectionApprovalClone();
    this.form = this.fb.group({
      basicInfo :this.fb.group(modal.buildBasicInfo(true)),
      explanation :this.fb.group(modal.buildExplanation(true)),
    })
  }
  _afterBuildForm(): void {
    this.setDefaultValues()
    this.checkDisableFields()
    this.listenToDurationChanges()
    this.listenToRequestClassificationChanges()
    this.handleReadonly();
  }
  _beforeSave(saveType: SaveTypes): boolean | Observable<boolean> {
    return of(this.form.valid)
      .pipe(tap(valid=>!valid&& this.invalidFormMessage()))
      .pipe(filter(valid=>valid))
      .pipe(map(_=>!!(this.model && this.model.collectionItemList.length)))
      .pipe(tap(hasCollectionItems=> !hasCollectionItems && this.invalidItemMessage()))

  }
  _beforeLaunch(): boolean | Observable<boolean> {
    if (this.model && !this.model.collectionItemList.length) {
      this.invalidItemMessage();
    }
    return true;
  }
  _afterLaunch(): void {
    this.resetForm$.next();
    this.toast.success(this.lang.map.request_has_been_sent_successfully);
  }
  _prepareModel(): CollectionApprovalClone | Observable<CollectionApprovalClone> {
    return new CollectionApprovalClone().clone({
      ...this.model,
      ...this.basicInfo.getRawValue(),
      ...this.specialExplanation.getRawValue()
    })
  }
  _afterSave(model: CollectionApprovalClone, saveType: SaveTypes, operation: OperationTypes): void {
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
    console.log(error);
  }
  _launchFail(error: any): void {
    console.log(error);
  }
  _destroyComponent(): void {
  }
  _updateForm(model: CollectionApprovalClone | undefined): void {
    if (!model) return;
    this.model = model;
    this.form.patchValue({
      basicInfo: model?.buildBasicInfo(),
      explanation: model?.buildExplanation()
    });
    this.handleRequestTypeChange(model.requestType, false);
  }
  _resetForm(): void {
    this.form.reset();
    this.model && (this.model.collectionItemList = []);
    this.operation = OperationTypes.CREATE;
    this.setDefaultValues();
    this.checkDisableFields();
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
    return this.form.get('basicInfo.licenseDurationType')!;
  }

  get requestClassification(): AbstractControl {
    return this.form.get('basicInfo.requestClassification')!;
  }

  handleRequestTypeChange(requestTypeValue: number, userInteraction: boolean = false){
    of(userInteraction).pipe(
      takeUntil(this.destroy$),
      switchMap(()=>this.confirmChangeRequestType(userInteraction))
    ).subscribe((clickOn:UserClickOn)=>{
      if(clickOn===UserClickOn.YES){
        if(userInteraction){
          this.resetForm$.next();
          this.requestType.setValue(requestTypeValue)
        }
        this.requestType$.next(requestTypeValue)
        this.disableSearchField = requestTypeValue ===CollectionRequestType.NEW
        this.model!.requestType = requestTypeValue;
      } else {
        this.requestType.setValue(this.requestType$.value)
      }
    })
  }
  isEditRequestTypeAllowed(){
    return !this.model?.id || (!!this.model?.id && this.model?.canCommit())
  }
  collectionItemFormStatusChanged($event:boolean){
    $event? this.disableFields() : this.checkDisableFields();
  }
  checkDisableFields(): void {
    this.model?.collectionItemList.length ? this.disableFields() : this.enableFields();
  }
  private disableFields() {
    this.requestType.disable();
    this.licenseDurationType.disable();
    this.requestClassification.disable();
  }
  private enableFields(): void {
    this.requestType.enable();
    this.licenseDurationType.enable();
    this.requestClassification.enable();
  }
  private setDefaultValues(){
    if(this.operation === OperationTypes.CREATE){
      this.requestType.patchValue(this.requestTypes[0].lookupKey);
      this.handleRequestTypeChange(this.requestTypes[0].lookupKey, false)
    }
  }
  private listenToDurationChanges() {
    this.licenseDurationType
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.model && (this.model.licenseDurationType = value);
      });
  }
  private listenToRequestClassificationChanges() {
    this.requestClassification
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.model && (this.model.requestClassification = value);
      });
  }
  handleReadonly(){
    if(!this.model?.id) return;
    let caseStatus= this.model?.getCaseStatus();
    if (caseStatus===CommonCaseStatus.FINAL_APPROVE || caseStatus === CommonCaseStatus.FINAL_NOTIFICATION){
      this.readonly = true;
      return;
    }
    if (this.openFrom ===OpenFrom.USER_INBOX){
      if (this.employeeService.isCharityManager()) {
        this.readonly = false;
      } else if (this.employeeService.isCharityUser()) {
        this.readonly = !this.model.isReturned();
      }
    } else if (this.openFrom ===OpenFrom.TEAM_INBOX){
      if (this.model.taskDetails.isClaimed()) {
        if (this.employeeService.isCharityManager()) {
          this.readonly = false;
        } else if (this.employeeService.isCharityUser()) {
          this.readonly = !this.model.isReturned();
        }
      }
    } else if (this.openFrom === OpenFrom.SEARCH){
      if (this.model?.canCommit()) {
        this.readonly = false;
      }
    }
  }
  invalidFormMessage(){
    this.dialog.error(this.lang.map.msg_all_required_fields_are_filled);
  }
  invalidItemMessage(){
    this.dialog.error(this.lang.map.please_add_collection_items_to_proceed);
  }
}
