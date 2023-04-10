import {Directive, EventEmitter, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {SaveTypes} from '@app/enums/save-types';
import {IESComponent} from '@app/interfaces/iescomponent';
import {BehaviorSubject, isObservable, Observable, of, Subject} from 'rxjs';
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  map,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import {ICaseModel} from '@app/interfaces/icase-model';
import {LangService} from '@app/services/lang.service';
import {CaseModel} from '@app/models/case-model';
import {OpenFrom} from '@app/enums/open-from.enum';
import {CustomValidators} from '@app/validators/custom-validators';
import {CaseTypes} from '@app/enums/case-types.enum';
import {CommonCaseStatus} from '@app/enums/common-case-status.enum';
import {BaseGenericEService} from '@app/generics/base-generic-e-service';
import {FileIconsEnum} from '@app/enums/file-extension-mime-types-icons.enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {FactoryService} from '@services/factory.service';
import {AttachmentTypeService} from '@services/attachment-type.service';
import {HasAttachmentHandlerDirective} from '@app/shared/directives/has-attachment-handler.directive';
import {AttachmentHandlerDirective} from '@app/shared/directives/attachment-handler.directive';
import {TabsListComponent} from '@app/shared/components/tabs/tabs-list.component';
import {CommonUtils} from '@helpers/common-utils';
import {FieldControlAndLabelKey} from '@app/types/types';

@Directive()
export abstract class EServicesGenericComponent<M extends ICaseModel<M>, S extends BaseGenericEService<M>> implements OnInit, OnDestroy, IESComponent<M> {
  afterSave$: EventEmitter<M> = new EventEmitter<M>();
  fromWrapperComponent: boolean = false;
  onModelChange$: EventEmitter<M | undefined> = new EventEmitter<M | undefined>();
  accordionView: boolean = false;
  _saveTypes: typeof SaveTypes = SaveTypes;
  save: Subject<SaveTypes> = new Subject<SaveTypes>();
  launch$: Subject<null> = new Subject<null>();
  private afterLaunch$: Subject<boolean> = new Subject<boolean>()
  resetForm$: Subject<boolean> = new Subject<boolean>();
  fromDialog: boolean = false;
  openFrom: OpenFrom = OpenFrom.ADD_SCREEN;
  readonly: boolean = false;
  allowEditRecommendations?: boolean | undefined;
  operationTypes: typeof OperationTypes = OperationTypes;
  operation: OperationTypes = OperationTypes.CREATE;
  modelChange$: BehaviorSubject<M | undefined> = new BehaviorSubject<M | undefined>(this._getNewInstance());
  destroy$: Subject<any> = new Subject<any>();
  model?: M;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  caseTypes = CaseTypes;
  fileIconsEnum = FileIconsEnum;

  formValidity$: Subject<any> = new Subject<any>();

  formProperties: Record<string, () => Observable<any>> = {};
  requestType$: BehaviorSubject<number | null> = new BehaviorSubject<number | null>(null);

  attachmentHandlers: HasAttachmentHandlerDirective[] = [];

  abstract lang: LangService;
  abstract form: UntypedFormGroup;
  abstract fb: UntypedFormBuilder;
  abstract service: S;

  private saveMethods: Record<SaveTypes, keyof Omit<ICaseModel<M>, 'id'>> = {
    [SaveTypes.FINAL]: 'save',
    [SaveTypes.COMMIT]: 'commit',
    [SaveTypes.DRAFT]: 'draft',
    [SaveTypes.DRAFT_CONTINUE]: 'draft',
  };

  @ViewChild(TabsListComponent) mainTabsListRef!: TabsListComponent;

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
    this.destroy$.unsubscribe();
    this._destroyComponent();
  }

  ngOnInit(): void {
    of(null)
      .pipe(tap(_ => this._initComponent()))
      .pipe(tap(_ => this._buildForm()))
      .pipe(tap(_ => this._listenToSave()))
      .pipe(tap(_ => this._listenToModelChange()))
      .pipe(tap(_ => this._listenToResetForm()))
      .pipe(tap(_ => this._listenToLaunch()))
      .pipe(tap(_ => this._listenToValidateForms()))
      .pipe(tap(_ => this.operation === OperationTypes.UPDATE && this._afterOpenCase(this.model!)))
      .pipe(delay(0))// delay
      .pipe(tap(_ => this._afterBuildForm()))
      .subscribe();
  }

  @Input()
  set outModel(model: M | undefined) {
    this.operation = OperationTypes.UPDATE;
    this.modelChange$.next(model);
  }

  get outModel(): M | undefined {
    return this.modelChange$.value;
  }

  _saveModel(model: M, saveType: SaveTypes): Observable<{ saveType: SaveTypes, model: M }> {
    const modelInstance = model as unknown as CaseModel<any, any>;
    const type = (!modelInstance.canSave() && saveType === SaveTypes.FINAL) ? SaveTypes.COMMIT : saveType;
    return model[this.saveMethods[type]]().pipe(map(m => ({saveType: type, model: m})));
  }

  _listenToSave(): void {
    this.save
      .pipe(
        // before save
        switchMap(saveType => {
          const result = this._beforeSave(saveType === SaveTypes.DRAFT_CONTINUE ? SaveTypes.DRAFT : saveType);
          return isObservable(result) ? result : of(result);
        }),
        // emit only if the beforeSave returned true
        filter(value => !!value),
        // prepare model
        switchMap(_ => {
          const model = this._prepareModel();
          return isObservable(model) ? model : of(model);
        }),
        // with save type
        withLatestFrom(this.save),
        // calling the save method
        exhaustMap(([model, saveType]) => {
          return this._saveModel(model, saveType).pipe(catchError(error => {
            // handle the errors came from backend
            this._saveFail(error);
            return of({saveType: saveType, model: null});
          }));
        }),
        // allow only success save
        filter((model: { saveType: SaveTypes, model: M | null }): model is { saveType: SaveTypes, model: M } => !!model.model)
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        this._afterSave(result.model, result.saveType, this.operation);
        this.operation = OperationTypes.UPDATE;
        this.afterSave$.emit(result.model);
        if (result.saveType === SaveTypes.DRAFT_CONTINUE) {
          this.goToNextTab();
        }
      });
  }

  _listenToModelChange(): void {
    this.modelChange$
      .pipe(takeUntil(this.destroy$))
      .pipe(tap(model => this.operation === OperationTypes.CREATE ? this.model = model : null))
      .pipe(switchMap(model => {
        return this.operation === OperationTypes.UPDATE ? of(model) : of(model).pipe(skip(1));
      }))
      .subscribe((model) => {
        model && this._updateForm(model);
      });
  }

  _listenToResetForm(): void {
    this.resetForm$
      .pipe(
        takeUntil(this.destroy$),
        switchMap((needConfirmation) => {
          if (needConfirmation) {
            return this.confirmResetForm().onAfterClose$;
          } else {
            return of(UserClickOn.YES);
          }
        })
      )
      .subscribe((userClick: UserClickOn) => {
        if (userClick === UserClickOn.YES) {
          this.operation = OperationTypes.CREATE;
          this._resetForm();
          this.requestType$.next(null);
        }
      });
  }

  _listenToLaunch() {
    this.launch$
      .pipe(
        switchMap(_ => {
          const result = this._beforeLaunch();
          return isObservable(result) ? result : of(result);
        }),
        exhaustMap(_ => {
          const model = this.model as unknown as CaseModel<any, any>;
          return model.start().pipe(catchError(error => {
            this._launchFail(error);
            return of(false);
          }));
        }),
        filter<boolean | null, boolean>((value): value is boolean => {
          return !!value;
        }),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.afterLaunch$.next(true);
        (this.model as unknown as CaseModel<any, any>).caseStatus = CommonCaseStatus.UNDER_PROCESSING;
        this._afterLaunch();
        this.onModelChange$.emit(this._getNewInstance());
      });
  }

  _listenToValidateForms(): void {
    this.formValidity$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(of(this._validateForms())))
      .subscribe(([element, forms]) => {
        if (!forms || !forms.length) {
          return;
        }
        forms.forEach(form => form.markAllAsTouched());
        if (!element) {
          return;
        }
        let ele: HTMLElement | null = null;
        if (typeof element === 'string') {
          ele = document.getElementById(element);
        } else if (element instanceof HTMLElement) {
          ele = element;
        }
        ele?.scrollTo({top: 0, behavior: 'smooth'});
      });
  }

  abstract _getNewInstance(): M;

  abstract _initComponent(): void;

  abstract _buildForm(): void;

  abstract _afterBuildForm(): void;

  abstract _beforeSave(saveType: SaveTypes): boolean | Observable<boolean>;

  abstract _beforeLaunch(): boolean | Observable<boolean>;

  abstract _afterLaunch(): void ;

  abstract _prepareModel(): M | Observable<M>;

  abstract _afterSave(model: M, saveType: SaveTypes, operation: OperationTypes): void;

  abstract _saveFail(error: any): void;

  abstract _launchFail(error: any): void;

  abstract _destroyComponent(): void;

  abstract _updateForm(model: M | undefined): void;

  abstract _resetForm(): void;


  protected markFieldsRequired(fields: AbstractControl[], emitEvent: boolean = false): void {
    fields.forEach(ctrl => {
      ctrl.addValidators(CustomValidators.required)
      ctrl.updateValueAndValidity({emitEvent})
    })
  }

  protected markFieldsOptional(fields: AbstractControl[], emitEvent: boolean = false): void {
    fields.forEach(ctrl => {
      ctrl.removeValidators(CustomValidators.required)
      ctrl.updateValueAndValidity({emitEvent})
    })
  }

  protected setFieldsToNull(fields: AbstractControl[], emitEvent: boolean = false): void {
    fields.forEach(ctrl => {
      ctrl.setValue(null, {emitEvent})
      ctrl.updateValueAndValidity({emitEvent})
    })
  }

  /**
   * @description return here array of forms that you need to make it as touched to display the validation message below it
   */
  _validateForms(): UntypedFormGroup[] {
    return [this.form];
  }

  launch(): Observable<boolean> {
    return (() => {
      return this.afterLaunch$
        .pipe(takeUntil(this.destroy$))
        .pipe(take(1))
        .pipe(startWith(false))
        .pipe(tap(value => !value && this.launch$.next(null)))
        .pipe(filter((value) => value))
    })();
  }

  displayMissingRequiredAttachmentsDialog() {
    this.service.dialog.info(this.lang.map.msg_launch_missing_mandatory_attachments);
  }

  registerAttachmentHandler(attachmentHandlerDirective: AttachmentHandlerDirective): void {
    this.attachmentHandlers.push(attachmentHandlerDirective);
  }

  hasMissingRequiredMultiAttachments(): boolean {
    return !!(this.attachmentHandlers && this.attachmentHandlers.length
      && this.attachmentHandlers.some(validator => validator.hasMissingRequiredAttachments()));
  }

  hasMissingRequiredAttachments(): Observable<boolean> {
    let service = FactoryService.getService<AttachmentTypeService>('AttachmentTypeService');
    return of(false).pipe(
      switchMap(() => {
        return of(service.attachmentsComponent.hasMissingRequiredAttachments() || this.hasMissingRequiredMultiAttachments());
      })
    );
  }

  checkIfHasMissingRequiredAttachments(): Observable<boolean> {
    let service = FactoryService.getService<AttachmentTypeService>('AttachmentTypeService');
    return of(service.attachmentsComponent)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(_ => {
          if (!service.attachmentsComponent) {
            return of(true);
          }
          return this.hasMissingRequiredAttachments();
        }),
        map((isMissingRequiredAttachments) => {
          if (isMissingRequiredAttachments) {
            this.displayMissingRequiredAttachmentsDialog();
          }
          return !isMissingRequiredAttachments
        })
      );
  }

  getObservableField(getterName: string, modelProperty?: string): Observable<any> {
    modelProperty = modelProperty ? modelProperty : getterName;
    const currentModel = (this.model as Record<string, any>);
    const value = currentModel.hasOwnProperty(modelProperty) ? currentModel[modelProperty] : null;
    return (this[getterName as keyof EServicesGenericComponent<any, any>] as unknown as UntypedFormControl).valueChanges.pipe(startWith<any, any>(value));
  }

  confirmResetForm(): DialogRef {
    return this.service.dialog.confirm(this.lang.map.msg_confirm_reset_form);
  }

  confirmChangeRequestType(userInteraction: boolean): Observable<UserClickOn> {
    if (!userInteraction) {
      return of(UserClickOn.YES);
    } else {
      if (!this.requestType$.value) {
        return of(UserClickOn.YES);
      } else {
        return this.confirmResetForm().onAfterClose$;
      }
    }
  }

  // if you need to load some lookups based on your model when you open it for the first time from search or inboxes
  // note this method will work only if you open it from inboxes or search, and it will work one time only
  _afterOpenCase(model: M): void {

  }

  goToNextTab() {
    if (!CommonUtils.isValidValue(this.mainTabsListRef)) {
      return;
    }
    const activeTabIndex = this.mainTabsListRef.getActiveTabIndex();
    if (activeTabIndex === -1) {
      this.mainTabsListRef.tabListService.selectTabByIndex(0);
    } else if (activeTabIndex < this.mainTabsListRef.tabs.length - 1) {
      const nextActiveIndex = this.mainTabsListRef.getNextActiveTabIndex();
      this.mainTabsListRef.tabListService.selectTabByIndex(nextActiveIndex <= 0 ? 0 : nextActiveIndex);
    }
  }

  getInvalidDraftField(fieldsList: FieldControlAndLabelKey[]): FieldControlAndLabelKey | undefined {
    let inValidItem;
    for (const item of fieldsList) {
      if (item.control.invalid) {
        inValidItem = item;
        break;
      }
    }
    return inValidItem;
  }

}
