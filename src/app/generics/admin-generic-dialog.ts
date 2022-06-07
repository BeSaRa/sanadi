import {Directive, OnDestroy, OnInit} from "@angular/core";
import {isObservable, Observable, of, Subject} from "rxjs";
import {IAdminGenericInterface} from "@app/interfaces/iadmin-generic-interface";
import {FormBuilder, FormGroup} from "@angular/forms";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {catchError, exhaustMap, filter, switchMap} from "rxjs/operators";
import {BaseModel} from "@app/models/base-model";
import {CustomValidators} from '@app/validators/custom-validators';
import {CommonStatusEnum} from '@app/enums/common-status.enum';

@Directive()
export abstract class AdminGenericDialog<M extends BaseModel<any, any>> implements OnInit, OnDestroy, IAdminGenericInterface<M> {
  // to be injected from main component
  abstract fb: FormBuilder;
  abstract model: M;
  abstract form: FormGroup;
  abstract operation: OperationTypes;
  abstract dialogRef: DialogRef;
  destroy$: Subject<any> = new Subject<any>();
  save$: Subject<any> = new Subject<any>();
  validateFieldsVisible: boolean = true;
  operationTypes: typeof OperationTypes = OperationTypes;
  customValidators = CustomValidators;
  inputMaskPatterns = CustomValidators.inputMaskPatterns;
  commonStatusEnum = CommonStatusEnum;

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
   * @param form {FormGroup}
   * @returns {Observable<boolean>|boolean}
   */
  abstract beforeSave(model: M, form: FormGroup): Observable<boolean> | boolean;

  /**
   * @description method to return the model that you need to call save on it
   * @param model
   * @param form
   */
  abstract prepareModel(model: M, form: FormGroup): Observable<M> | M;

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
        return isObservable(result) ? result : of(result)
      }))
      // filter the return value from saveBeforeCallback and allow only the true
      .pipe(filter(value => value))
      .pipe(switchMap(_ => {
        const result = this.prepareModel(this.model, this.form);
        return isObservable(result) ? result : of(result);
      }))
      .pipe(exhaustMap((model: M) => {
        return model.save().pipe(catchError(error => {
          this.saveFail(error);
          return of({
            error: error,
            model
          })
        }))
      }))
      .pipe(filter((value) => !value.hasOwnProperty('error')))
      .subscribe((model: M) => {
        this.afterSave(model, this.dialogRef);
      })
  }

  /**
   * @description validate main form or given from and display the highlighted errors
   * @param form {FormGroup|null}
   * @param element {HTMLElement|string}
   */
  displayFormValidity(form?: FormGroup | null, element?: HTMLElement | string): void {
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
      ele.scrollTo({top: 0, behavior: "smooth"});
    }
  }

  // noinspection JSUnusedGlobalSymbols
  markFormPristine(form?: FormGroup): void {
    form ? form.markAsPristine() : this.form.markAsPristine();
  }
}
