import {Directive, OnDestroy, OnInit} from "@angular/core";
import {isObservable, Observable, of, Subject} from "rxjs";
import {IAdminGenericInterface} from "@app/interfaces/iadmin-generic-interface";
import {FormBuilder, FormGroup} from "@angular/forms";
import {OperationTypes} from "@app/enums/operation-types.enum";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {catchError, exhaustMap, filter, switchMap} from "rxjs/operators";
import {BaseModel} from "@app/models/base-model";

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


  ngOnInit(): void {
    this.buildForm();
    this.listenToSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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
   * @description use this method to build your form
   */
  abstract buildForm(): void;
}
