import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {LangService} from "@app/services/lang.service";
import {of, Subject} from "rxjs";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {FormManager} from "@app/models/form-manager";
import {CustomTerm} from "@app/models/custom-term";
import {ToastService} from "@app/services/toast.service";
import {DialogRef} from "@app/shared/models/dialog-ref";
import {CustomValidators} from "@app/validators/custom-validators";
import {catchError, exhaustMap, takeUntil} from "rxjs/operators";
import {ExceptionHandlerService} from "@app/services/exception-handler.service";
import {DIALOG_DATA_TOKEN} from "@app/shared/tokens/tokens";

@Component({
  selector: 'custom-term-popup',
  templateUrl: './custom-term-popup.component.html',
  styleUrls: ['./custom-term-popup.component.scss']
})
export class CustomTermPopupComponent implements OnInit, OnDestroy {
  private save$: Subject<void> = new Subject<void>();
  private destroy$: Subject<void> = new Subject();
  form!: UntypedFormGroup;
  model!: CustomTerm;
  fm!: FormManager;

  constructor(@Inject(DIALOG_DATA_TOKEN) private data: { model: CustomTerm, caseType: number },
              public lang: LangService, private toast: ToastService,
              private dialogRef: DialogRef, private fb: UntypedFormBuilder,
              private exceptionHandlerService: ExceptionHandlerService) {
    this.model = data.model
  }

  ngOnInit(): void {
    this.buildForm();
    this._saveModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  buildForm(): void {
    this.form = this.fb.group({
      terms: [this.model.terms, [CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.EXPLANATIONS)]],
      caseType: this.model.caseType
    });
    this.fm = new FormManager(this.form, this.lang);
  }


  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const customTerm = (new CustomTerm()).clone({...this.model, ...this.form.value});
          return customTerm.save().pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
              return of(null);
            })
          );
        }))
      .subscribe((customTerm: CustomTerm | null) => {
        if (!customTerm) {
          return;
        }

        const message = this.lang.map.msg_create_x_success;
        this.toast.success(message.change({x: this.lang.map.custom_terms}));
        this.model = customTerm;
        this.dialogRef.close(this.model);
      });
  }
}
