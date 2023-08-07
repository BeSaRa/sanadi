import {AfterViewInit, Directive, ElementRef, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {isObservable, Observable, of, Subject} from 'rxjs';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonStatusEnum} from '@enums/common-status.enum';
import {filter, switchMap, take} from 'rxjs/operators';
import {LangService} from '@services/lang.service';
import {CaseTypes} from '@enums/case-types.enum';
import {DialogService} from '@services/dialog.service';
import {ToastService} from '@services/toast.service';
import {ILanguageKeys} from '@contracts/i-language-keys';
import {UiCrudDialogComponentDataContract} from "@contracts/ui-crud-dialog-component-data-contract";
import {CommonUtils} from "@helpers/common-utils";
import {DateUtils} from "@helpers/date-utils";
import {DatepickerOptionsMap} from "@app/types/types";

@Directive()
export abstract class UiCrudDialogGenericComponent<M> implements OnInit, AfterViewInit, OnDestroy {
  abstract fb: UntypedFormBuilder;
  abstract dialogRef: DialogRef;
  abstract popupTitleKey: keyof ILanguageKeys;

  /**
   * @description Get the text to append to popup heading.
   *
   *
   * example: Edit User : User1, View User : User 1
   */
  abstract getPopupHeadingText(): string;

  abstract _getNewInstance(override?: Partial<M>): M;
  abstract _isDuplicate(record1: Partial<M>, record2: Partial<M>): boolean;

  lang = inject(LangService);
  toast = inject(ToastService);
  dialogService = inject(DialogService);

  model!: M;
  form!: UntypedFormGroup;
  operation!: OperationTypes;

  destroy$: Subject<any> = new Subject<any>();
  save$: Subject<any> = new Subject<any>();
  validateFieldsVisible: boolean = true;
  saveVisible: boolean = true;
  operationTypes: typeof OperationTypes = OperationTypes;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  commonStatusEnum = CommonStatusEnum;
  caseTypes = CaseTypes;
  list: M[] = [];
  listIndex: number = -1;
  readonly: boolean = false;
  hideFullScreen: boolean = false;

  @ViewChild('dialogContent') dialogContent!: ElementRef;

  get popupTitle(): string {
    try {
      if (this.operation === OperationTypes.CREATE) {
        return this.lang.map.lbl_add_x.change({x: this.lang.map[this.popupTitleKey]});
      } else if (this.operation === OperationTypes.UPDATE) {
        return this.lang.map.lbl_edit_x.change({
          x: this.lang.map[this.popupTitleKey] + (this.getPopupHeadingText() ? ' : ' + this.getPopupHeadingText() : '')
        });
      } else if (this.operation === OperationTypes.VIEW) {
        return this.lang.map.lbl_view_x.change({
          x: this.lang.map[this.popupTitleKey] + (this.getPopupHeadingText() ? ' : ' + this.getPopupHeadingText() : '')
        })
      }
      return '';
    } catch (e) {
      return '';
    }
  }

  ngOnInit(): void {
    this.buildForm();
    this.listenToSave();
    this.initPopup();
  }

  ngAfterViewInit() {
    Promise.resolve().then(() => {
      this.setReadonly(this.operation === OperationTypes.VIEW);

      if (this.operation === OperationTypes.UPDATE) {
        this.displayFormValidity(this.form, this.dialogContent.nativeElement);
      }
      if (this.readonly) {
        this.form.disable();
        this.saveVisible = false;
        this.validateFieldsVisible = false;
      }
      this._afterViewInit();
    })
  }

  protected _afterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyPopup();
  }

  abstract initPopup(): void;

  abstract destroyPopup(): void;

  /***
   * @description this method invoked after save succeed
   * @param savedModel
   * @param originalModel
   * @returns void
   */
  abstract afterSave(savedModel: M, originalModel: M): void;

  /**
   * @description this method invoked before save usually used to validate something before calling save on the model,
   * true to proceed false to prevent save process
   * @param model {M}
   * @param form {UntypedFormGroup}
   * @returns {Observable<boolean>|boolean}
   */
  abstract beforeSave(model: M, form: UntypedFormGroup): Observable<boolean> | boolean;

  /**
   * @description method to return the model that you need to call save on it
   * @param model
   * @param form
   */
  abstract prepareModel(model: M, form: UntypedFormGroup): Observable<M> | M;

  /**
   * @description when you get any error while save process, usually used to display error messages
   * @param error
   */
  abstract saveFail(error: Error): void

  /**
   * @description use this method to build your form
   */
  abstract buildForm(): void;

  setInitDialogData(data: UiCrudDialogComponentDataContract<M>){
    this.model = data.model;
    this.operation = data.operation;
    this.listIndex = data.listIndex;
    this.list = data.list;
  }

  /**
   * @description default implementation to listen to save method you can override it if you need custom logic
   */
  listenToSave() {
    this.save$
      // call before Save callback
      .pipe(switchMap(() => {
        if (this.readonly) {
          return of(false);
        }
        const result = this.beforeSave(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .subscribe((updatedModel: M) => {
        this.afterSave(updatedModel, this.model);
      });
  }

  /**
   * @description validate main form or given from and display the highlighted errors
   * @param form {UntypedFormGroup|null}
   * @param element {HTMLElement|string}
   */
  displayFormValidity(form?: UntypedFormGroup | null, element?: HTMLElement | string): void {
    if (!form) {
      this.form.markAllAsTouched();
    } else {
      form.markAllAsTouched();
    }

    let ele: HTMLElement | false = false;
    if (!element) {
      return;
    }
    element instanceof HTMLElement && (ele = element);
    typeof element === 'string' && (ele = document.getElementById(element) as HTMLElement);
    if (ele) {
      ele.scrollTo({top: 0, behavior: 'smooth'});
    }
  }

  displayRequiredFieldsMessage(): void {
    this.dialogService
      .error(this.lang.map.msg_all_required_fields_are_filled)
      .onAfterClose$.pipe(take(1))
      .subscribe(() => {
        this.form.markAllAsTouched();
      });
  }

  displayDuplicatedItemMessage(): void {
    this.toast.alert(this.lang.map.msg_duplicate_record_in_list);
  }

  setReadonly(readonly: boolean) {
    this.readonly = readonly;
  }

  isDuplicateInList(formValue: any): boolean {
    if (this.operation === OperationTypes.CREATE) {
      return this.list.some((item) => this._isDuplicate(item, formValue));
    }
    if (this.operation === OperationTypes.UPDATE) {
      return this.list.some((item: M, index: number) => {
        return index !== this.listIndex && this._isDuplicate(item, formValue);
      });
    }
    return false;
  }
}
