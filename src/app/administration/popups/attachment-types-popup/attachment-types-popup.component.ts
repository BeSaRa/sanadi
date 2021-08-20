import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from '../../../services/lang.service';
import {CustomValidators} from '../../../validators/custom-validators';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {of, Subject} from 'rxjs';
import {AttachmentType} from '../../../models/attachment-type';
import {ExceptionHandlerService} from '../../../services/exception-handler.service';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {Lookup} from '../../../models/lookup';
import {LookupService} from '../../../services/lookup.service';
import {ToastService} from '../../../services/toast.service';
import {DialogRef} from '../../../shared/models/dialog-ref';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {ServiceDataService} from '../../../services/service-data.service';
import {ServiceData} from '../../../models/service-data';
import {AttachmentTypeService} from '../../../services/attachment-type.service';
import {AttachmentTypeServiceData} from '../../../models/attachment-type-service-data';
import {AttachmentTypeServiceDataService} from '../../../services/attachment-type-service-data.service';
import {UserClickOn} from '../../../enums/user-click-on.enum';
import {DialogService} from '../../../services/dialog.service';

@Component({
  selector: 'attachment-types-popup',
  templateUrl: './attachment-types-popup.component.html',
  styleUrls: ['./attachment-types-popup.component.scss']
})
export class AttachmentTypesPopupComponent implements OnInit, OnDestroy {
  statuses: Lookup[] = this.lookupService.listByCategory.CommonStatus;
  form!: FormGroup;
  fm!: FormManager;
  operation!: OperationTypes;
  model!: AttachmentType;
  validateFieldsVisible = true;
  saveVisible = true;
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  private makeAttachmentTypeGlobal$: Subject<number> = new Subject<number>();
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    services: {name: 'services'}
  };
  services: ServiceData[] = [];

  list: AttachmentTypeServiceData[] = [];
  columns = ['arName', 'enName', 'isActive', 'actions'];
  validToAddServices = false;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<AttachmentType>,
              public lang: LangService,
              private fb: FormBuilder,
              private exceptionHandlerService: ExceptionHandlerService,
              private lookupService: LookupService,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private servicesService: ServiceDataService,
              private attachmentTypeService: AttachmentTypeService,
              private attachmentTypeServiceDataService: AttachmentTypeServiceDataService,
              private dialogService: DialogService) {
    this.operation = data.operation;
    this.model = data.model;
  }

  ngOnInit(): void {
    this.listenToIsGlobalChange();
    this.buildForm();
    this._saveModel();
    if(this.model.id) {
      this.loadServiceData();
      this.validToAddServices = !this.model.global;
    }
  }

  private buildForm(): void {
    this.form = this.fb.group({
      arName: [this.model.arName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]],
      enName: [this.model.enName, [
        CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]],
      status: [this.model.status, [CustomValidators.required]],
      global: [this.model.global]
    });
    this.fm = new FormManager(this.form, this.lang);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.lang.map.lbl_add_attachment_type : this.lang.map.lbl_edit_attachment_type;
  };

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    let attachmentTypeHasChangedToGlobal = false;
     this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          attachmentTypeHasChangedToGlobal = !this.model.global && this.fm.getFormField('global')?.value;

          const attachmentType = (new AttachmentType()).clone({...this.model, ...this.fm.getForm()?.value})
          return attachmentType.save().pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
              return of(null);
            }));
        }))
      .subscribe((attachmentType: AttachmentType | null) => {
        if (!attachmentType) {
          return;
        }
        this.validToAddServices = !attachmentType.global;
        const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
        // @ts-ignore
        this.toast.success(message.change({x: attachmentType.getName()}));
        this.model = attachmentType;
        this.operation = OperationTypes.UPDATE;
        // this.dialogRef.close(this.model);
        if(attachmentTypeHasChangedToGlobal && this.list.length > 0) {
          this.makeAttachmentTypeGlobal$.next(attachmentType.id);
        }
      });
  }

  private loadServiceData(): void {
    this.attachmentTypeServiceDataService.loadServicesByAttachmentTypeId(this.model.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.list = services;
      });
  }

  reload() {
    this.loadServiceData();
  }

  addService(): void {
    const sub = this.attachmentTypeServiceDataService.openCreateServiceDialog(this.model.id).onAfterClose$.subscribe(() => {
      this.reload();
      sub.unsubscribe();
    });
  }

  edit(attachmentTypeServiceData: AttachmentTypeServiceData, $event: MouseEvent): void {
    $event.preventDefault();
    const sub = this.attachmentTypeServiceDataService.openUpdateServiceDialog(attachmentTypeServiceData.id, this.model.id).subscribe((dialog: DialogRef) => {
      dialog.onAfterClose$.subscribe((_) => {
        this.reload();
        sub.unsubscribe();
      });
    });
  }

  delete(event: MouseEvent, model: AttachmentTypeServiceData): void {
    event.preventDefault();
    // @ts-ignore
    const message = this.lang.map.msg_confirm_delete_x.change({x: model.getName()});
    this.dialogService.confirm(message)
      .onAfterClose$.subscribe((click: UserClickOn) => {
      if (click === UserClickOn.YES) {
        const sub = model.delete().subscribe(() => {
          // @ts-ignore
          this.toast.success(this.lang.map.msg_delete_x_success.change({x: model.getName()}));
          this.reload();
          sub.unsubscribe();
        });
      }
    });
  }

  listenToIsGlobalChange() {
    this.makeAttachmentTypeGlobal$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((attachmentTypeId) => {
      this.attachmentTypeServiceDataService.makeGlobal(attachmentTypeId)
        .pipe(catchError((err) => {
          this.exceptionHandlerService.handle(err);
          return of(false);
        }))
        .subscribe((success: boolean) => {
          if(success) {
            this.list = [];
          }
        });
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
