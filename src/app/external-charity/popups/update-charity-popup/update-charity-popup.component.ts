import { Component, inject, Inject, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ExternalCharityRequestType } from '@app/enums/external-charity-request-type';
import { FileIconsEnum } from '@app/enums/file-extension-mime-types-icons.enum';
import { OperationTypes } from '@app/enums/operation-types.enum';
import { ExternalCharityAttachmentsComponent } from '@app/external-charity/shared/external-charity-attachments/external-charity-attachments.component';
import { AdminGenericDialog } from '@app/generics/admin-generic-dialog';
import { IDialogData } from '@app/interfaces/i-dialog-data';
import { ConvertExternalCharity } from '@app/models/convert-external-charity';
import { ConvertExternalCharityService } from '@app/services/convert-external-charity.service';
import { DialogService } from '@app/services/dialog.service';
import { LangService } from '@app/services/lang.service';
import { LookupService } from '@app/services/lookup.service';
import { ToastService } from '@app/services/toast.service';
import { DialogRef } from '@app/shared/models/dialog-ref';
import { DIALOG_DATA_TOKEN } from '@app/shared/tokens/tokens';
import { TabMap } from '@app/types/types';
import { BehaviorSubject, catchError, exhaustMap, filter, Observable, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { SelectExternalCharityPopupComponent } from '../select-external-charity-popup/select-external-charity-popup.component';
import { ExternalCharityFounder } from '@app/models/external-charity-founder';
import { TabsListComponent } from '@app/shared/components/tabs/tabs-list.component';
import { CommonUtils } from '@app/helpers/common-utils';

@Component({
    selector: 'update-charity-popup',
    templateUrl: 'update-charity-popup.component.html',
    styleUrls: ['update-charity-popup.component.scss']
})
export class UpdateCharityPopupComponent extends AdminGenericDialog<ConvertExternalCharity> {

    form!: UntypedFormGroup;
    model!: ConvertExternalCharity;
    operation: OperationTypes;
    saveVisible = true;
  
  
    dialogRef = inject(DialogRef);
    fb = inject(UntypedFormBuilder);
    lang = inject(LangService);
    toast = inject(ToastService);
    lookupService = inject(LookupService);
    service = inject(ConvertExternalCharityService);
    dialog = inject(DialogService);
    formProperties: Record<string, () => Observable<any>> = {};
  
    requestTypes = this.lookupService.listByCategory.EXTERNAL_CHARITY_REQUEST_TYPE
    serviceTypes = this.lookupService.listByCategory.EXTERNAL_CHARITY_SERVICE_TYPE
    workFields = this.lookupService.listByCategory.EXTERNAL_CHARITY_WORK_FIELD
    isAllAttachmentRequired$= new BehaviorSubject<boolean>(false);
    constructor(
      @Inject(DIALOG_DATA_TOKEN) data: IDialogData<ConvertExternalCharity>) {
      super();
      this.model = data.model;
      this.operation = data.operation;
    }
  
    initPopup(): void {
  
    }
  
    @ViewChild(ExternalCharityAttachmentsComponent) externalCharityAttachmentRef!: ExternalCharityAttachmentsComponent;
    buildForm(): void {
      this.form = this.fb.group(this.model.buildForm(true));
      if (this.operation === OperationTypes.VIEW) {
        this.form.disable();
        this.saveVisible = false;
        this.validateFieldsVisible = false;
      }
      this._listenToLicenseSearch();
      this._listenToRequestTypeChange();
    }
  
    beforeSave(model: ConvertExternalCharity, form: UntypedFormGroup): Observable<boolean> | boolean {
      // if(this.isAllAttachmentRequired$.value){
      //   if(this.externalCharityAttachmentRef.attachments .some(item=>!item.vsId)){
      //     this.service.dialog.info(this.lang.map.msg_launch_missing_mandatory_attachments);
      //     return false;
      //   }
      // }
      return form.valid;
    }
  
    prepareModel(model: ConvertExternalCharity, form: UntypedFormGroup): Observable<ConvertExternalCharity> | ConvertExternalCharity {
      return (new ConvertExternalCharity()).clone({ ...model, ...form.value });
    }
    @ViewChild(TabsListComponent, {static: true}) componentTabsListRef!: TabsListComponent;

    afterSave(model: ConvertExternalCharity, dialogRef: DialogRef): void {
      const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
      this.toast.success(message.change({ x: model.requestFullSerial }));
      this.model.id = model.id;
      this.operation = OperationTypes.UPDATE;
      this.goToNextActiveTab()
    }
  
    goToNextActiveTab() {
      if (!CommonUtils.isValidValue(this.componentTabsListRef) || this.componentTabsListRef.isLastActiveTab()) {
        return;
      }
  
      const currentActiveTabIndex = this.componentTabsListRef.getActiveTabIndex();
      let nextActiveTabIndex: number = 0;
      if (!this.componentTabsListRef.isIndexOutOfBound(currentActiveTabIndex)) {
        nextActiveTabIndex = this.componentTabsListRef.getNextActiveTabIndex();
        if (this.componentTabsListRef.isIndexOutOfBound(nextActiveTabIndex)) {
          nextActiveTabIndex = 0;
        }
      }
  
      if (currentActiveTabIndex !== nextActiveTabIndex) {
        this.componentTabsListRef.tabListService.selectTabByIndex(nextActiveTabIndex);
      }
    }
    saveFail(error: Error): void {
    }
  
    get popupTitle(): string {
      return this.lang.map.menu_update_external_charity;
    };
  
    destroyPopup(): void {
    }
  
    get requestTypeControl(): UntypedFormControl {
      return this.form.get('requestType') as UntypedFormControl
    }
    get previousRequestSerialControl(): UntypedFormControl {
      return this.form.get('previousRequestSerial') as UntypedFormControl
    }

    private _listenToRequestTypeChange() {
      this.requestTypeControl.valueChanges
        .pipe(
          tap(value => { this.isAllAttachmentRequired$.next(value === ExternalCharityRequestType.COMPLETION_OF_REGISTRATION) }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
    tabsData: TabMap = {
      basicInfo: {
        name: 'basicInfoTab',
        langKey: 'lbl_basic_info',
        index: 0,
        checkTouchedDirty: false,
        isTouchedOrDirty: () => false,
        show: () => true,
        validStatus: () => true
      },
      attachment: {
        name: 'attachmentTab',
        langKey: 'attachments',
        index: 1,
        isTouchedOrDirty: () => false,
        show: () => true,
        validStatus: () => true
      },
      logs: {
        name: 'logsTab',
        langKey: 'logs',
        index: 2,
        isTouchedOrDirty: () => false,
        show: () => this.model.logList.length>0,
        validStatus: () => true
      },
  
    };
    fileIconsEnum = FileIconsEnum
    isSearchAllowed() {
      return this.requestTypeControl.value && this.requestTypeControl.value !== ExternalCharityRequestType.NEW_REQUEST;
    }
    licenseSearch$: Subject<string> = new Subject<string>();
  
    licenseSearch($event?: Event): void {
      $event?.preventDefault();
      this.licenseSearch$.next(this.previousRequestSerialControl.value);
    }
    private _listenToLicenseSearch() {
      this.licenseSearch$
        .pipe(
          exhaustMap((previousRequestSerial?) => {
            const criteria = !!previousRequestSerial ? {
              requestFullSerial: previousRequestSerial,
            } : {}
            return this.service.loadByCriteria(criteria).pipe(catchError(() => of(<ConvertExternalCharity[]>[])));
          })
        )
        .pipe(
          tap((list) =>
            !list.length ? this.dialog.info(this.lang.map.no_result_for_your_search_criteria)
              : null
          ),
          // allow only the collection if it has value
          filter((result) => !!result.length),
          switchMap((list) => {
            return list.length === 1 ? of(list[0]):
              this.dialog.show<IDialogData<ConvertExternalCharity[]>>(SelectExternalCharityPopupComponent, {
                model: list,
                operation: OperationTypes.CREATE
              }).onAfterClose$
          }),
          filter((model?: ConvertExternalCharity) => !!model),
          tap((model) => {
           const updatedModel = new ConvertExternalCharity().clone({
              ...model!,
              requestType:this.requestTypeControl.value,
              previousRequestSerial: model?.requestFullSerial,
              requestFullSerial : undefined,
              founderList : model!.founderList.map(item=>new ExternalCharityFounder().clone({...item,
                id:undefined
              }))
              
            })
            this.form.patchValue(updatedModel);
          
          }),
          takeUntil(this.destroy$)
        )
        .subscribe();
    }
  }
