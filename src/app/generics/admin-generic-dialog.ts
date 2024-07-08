import {Directive, OnDestroy, OnInit} from '@angular/core';
import {isObservable, Observable, of, Subject} from 'rxjs';
import {IAdminGenericInterface} from '@app/interfaces/iadmin-generic-interface';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {catchError, exhaustMap, filter, switchMap} from 'rxjs/operators';
import {BaseModel} from '@app/models/base-model';
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';
import {BaseModelAdminLookup} from '@app/models/base-model-admin-lookup';

@Directive()
export abstract class AdminGenericDialog<M extends BaseModel<any, any> | BaseModelAdminLookup<any, any>> implements OnInit, OnDestroy, IAdminGenericInterface<M> {
  // to be injected from main component
  abstract fb: UntypedFormBuilder;
  abstract model: M;
  abstract form: UntypedFormGroup;
  abstract operation: OperationTypes;
  abstract dialogRef: DialogRef;
  destroy$: Subject<void> = new Subject();
  save$: Subject<void> = new Subject();
  validateFieldsVisible: boolean = true;
  operationTypes: typeof OperationTypes = OperationTypes;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  commonStatusEnum = CommonStatusEnum;
  adminLookupTypeId?: number;

  ngOnInit(): void {
    this.buildForm();
    this.listenToSave();
    this.initPopup();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyPopup();
  }

  abstract initPopup(): void

  abstract destroyPopup(): void

  /***
   * @description this method invoked after save succeed
   * @param model {M}
   * @param dialogRef {DialogRef}
   * @returns void
   */
  abstract afterSave(model: M, dialogRef: DialogRef): void;

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

  /**
   * @description default implementation to listen to save method you can override it if you need custom logic
   */
  listenToSave() {
    this.save$
      // call before Save callback
      .pipe(switchMap(() => {
        const result = this.beforeSave(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .pipe(exhaustMap((model: M) => {
        let save$ = this.adminLookupTypeId ? (model as BaseModelAdminLookup<any, any>).save(this.adminLookupTypeId) : (model as BaseModel<any, any>).save();
        return save$.pipe(catchError(error => {
          this.saveFail(error);
          return of({
            error: error,
            model
          });
        }));
      }))
      .pipe(filter((value) => !value.hasOwnProperty('error')))
      .subscribe((model: M) => {
        this.afterSave(model, this.dialogRef);
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

  // noinspection JSUnusedGlobalSymbols
  markFormPristine(form?: UntypedFormGroup): void {
    form ? form.markAsPristine() : this.form.markAsPristine();
  }
}
