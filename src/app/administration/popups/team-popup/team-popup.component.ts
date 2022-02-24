import {Component, Inject, OnInit} from '@angular/core';
import {of, Subject} from 'rxjs';
import {FormBuilder, FormGroup} from '@angular/forms';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {FormManager} from '@app/models/form-manager';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {ExceptionHandlerService} from '@app/services/exception-handler.service';
import {Team} from '@app/models/team';
import {LangService} from '@app/services/lang.service';
import {FactoryService} from '@app/services/factory.service';
import {CustomValidators} from '@app/validators/custom-validators';
import {catchError, exhaustMap, takeUntil} from 'rxjs/operators';
import {Lookup} from '@app/models/lookup';
import {LookupService} from '@app/services/lookup.service';
import {LookupCategories} from '@app/enums/lookup-categories';
import {InternalDepartment} from '@app/models/internal-department';

@Component({
  selector: 'team-popup',
  templateUrl: './team-popup.component.html',
  styleUrls: ['./team-popup.component.scss']
})
export class TeamPopupComponent implements OnInit {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  model: Team;
  operation: OperationTypes;
  fm!: FormManager;
  statusList: Lookup[];
  parentDepartmentsList: InternalDepartment[];
  validateFieldsVisible: boolean = true;
  saveVisible: boolean = true;

  constructor(@Inject(DIALOG_DATA_TOKEN) data: IDialogData<Team>,
              private toast: ToastService,
              private dialogRef: DialogRef,
              private fb: FormBuilder,
              public langService: LangService,
              private lookupService: LookupService,
              private exceptionHandlerService: ExceptionHandlerService) {
    this.model = data.model;
    this.operation = data.operation;
    this.parentDepartmentsList = data.parentDepartmentsList;
    this.statusList = lookupService.getByCategory(LookupCategories.COMMON_STATUS);
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
    // this.langService = FactoryService.getService('LangService');
    this.form = this.fb.group({
      arName: [this.model.arName, [
        CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
      ]],
      enName: [this.model.enName, [
        CustomValidators.required, CustomValidators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
        CustomValidators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
      ]],
      authName: [{
        value: this.model.authName,
        disabled: this.operation
      }, [CustomValidators.required]],
      parentDeptId: [this.model.parentDeptId, [CustomValidators.required]],
      ldapGroupName: [this.model.ldapGroupName, [CustomValidators.required]],
      status: [this.model.status, [CustomValidators.required]],
      autoClaim: [this.model.autoClaim],
      isHidden: [this.model.isHidden]
    }, {
      validators: CustomValidators.validateFieldsStatus([
        'arName', 'enName', 'authName', 'parentDeptId', 'ldapGroupName', 'status', 'autoClaim', 'isHidden'
      ])
    });
    this.fm = new FormManager(this.form, this.langService);
    // will check it later
    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
    if (this.operation === OperationTypes.VIEW){
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
    }
  }

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const team = (new Team()).clone({...this.model, ...this.form.value});
          return team.save().pipe(
            catchError((err) => {
              return of(null);
            })
          );
        }))
      .subscribe((result: Team | null) => {
        if (!result) {
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
        this.toast.success(message.change({x: result.getName()}));
        this.model = result;
        this.operation = OperationTypes.UPDATE;
        this.dialogRef.close(this.model);
      });
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE){
      return this.langService.map.lbl_add_team;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.langService.map.lbl_edit_team;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.langService.map.view;
    }
    return '';
  }
}
