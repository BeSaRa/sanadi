import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FormManager} from '../../../models/form-manager';
import {LangService} from '../../../services/lang.service';
import {OperationTypes} from '../../../enums/operation-types.enum';
import {DIALOG_DATA_TOKEN} from '../../../shared/tokens/tokens';
import {CustomRole} from '../../../models/custom-role';
import {IDialogData} from '../../../interfaces/i-dialog-data';
import {CustomValidators} from '../../../validators/custom-validators';
import {LookupService} from '../../../services/lookup.service';
import {LookupCategories} from '../../../enums/lookup-categories';
import {combineLatest, of, Subject} from 'rxjs';
import {PermissionService} from '../../../services/permission.service';
import {catchError, exhaustMap, take, takeUntil} from 'rxjs/operators';
import {Permission} from '../../../models/permission';
import {CheckGroup} from '../../../models/check-group';
import {CustomRolePermission} from '../../../models/custom-role-permission';
import {extender} from '../../../helpers/extender';
import {ToastService} from '../../../services/toast.service';
import {CustomRolePermissionService} from '../../../services/custom-role-permission.service';
import {Lookup} from '../../../models/lookup';
import {IKeyValue} from '../../../interfaces/i-key-value';
import {ExceptionHandlerService} from '../../../services/exception-handler.service';

@Component({
  selector: 'app-custom-role-popup',
  templateUrl: './custom-role-popup.component.html',
  styleUrls: ['./custom-role-popup.component.scss']
})
export class CustomRolePopupComponent implements OnInit, OnDestroy {
  private save$: Subject<any> = new Subject<any>();
  private destroy$: Subject<any> = new Subject<any>();
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: CustomRole;
  permissions!: Record<number, Permission[][]>;
  selectedPermissions: number[] = [];
  groups: CheckGroup<Permission>[] = [];
  tabsData: IKeyValue = {
    basic: {name: 'basic'},
    permissions: {name: 'permissions'}
  };
  saveVisible = true;
  validateFieldsVisible = true;

  constructor(@Inject(DIALOG_DATA_TOKEN)  data: IDialogData<CustomRole>,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private toast: ToastService,
              private customRolePermissionService: CustomRolePermissionService,
              private permissionService: PermissionService,
              public langService: LangService,
              private exceptionHandlerService: ExceptionHandlerService) {

    this.operation = data.operation;
    this.model = data.model;
    this.selectedPermissions = data.customRolePermissions.map((item: CustomRolePermission) => {
      return item.permissionId;
    });
  }

  setDialogButtonsVisibility(tab: any): void {
  }

  ngOnInit(): void {
    this.buildGroups();
    this.buildForm();
    this._saveModel();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

  private buildGroups() {
    combineLatest([this.permissionService.load(), of(this.lookupService.getByCategory(LookupCategories.PERMISSION_GROUP))])
      .pipe(take(1))
      .subscribe((result) => {
        const permissionByGroupId = CustomRolePopupComponent.buildPermissionsByGroupId(result[0]);
        result[1].forEach((group: Lookup) => {
          this.groups.push(new CheckGroup<Permission>(group, permissionByGroupId[group.lookupKey], this.selectedPermissions, 3));
        });
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        status: [this.model.status],
        arName: [this.model.arName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ARABIC_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('AR_NUM')
        ]],
        enName: [this.model.enName, [
          CustomValidators.required, Validators.maxLength(CustomValidators.defaultLengths.ENGLISH_NAME_MAX),
          Validators.minLength(CustomValidators.defaultLengths.MIN_LENGTH), CustomValidators.pattern('ENG_NUM')
        ]],
        description: [this.model.description, Validators.maxLength(200)],
      }, {validators: CustomValidators.validateFieldsStatus(['arName', 'enName'])}),
      permissions: [!!this.selectedPermissions.length, Validators.requiredTrue]
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.lbl_add_custom_role : this.langService.map.lbl_edit_custom_role;
  };

  saveModel(): void {
    this.save$.next();
  }

  _saveModel(): void {
    this.save$
      .pipe(takeUntil(this.destroy$),
        exhaustMap(() => {
          const customRole = extender<CustomRole>(CustomRole, {...this.model, ...this.fm.getFormField('basic')?.value});
          customRole.setPermissionSet(this.selectedPermissions);
          return customRole.save().pipe(
            catchError((err) => {
              this.exceptionHandlerService.handle(err);
              return of(null);
            }));
        }))
      .subscribe((customRole: CustomRole | null) => {
        if (!customRole){
          return;
        }
        const message = this.operation === OperationTypes.CREATE ? this.langService.map.msg_create_x_success : this.langService.map.msg_update_x_success;
        // @ts-ignore
        this.toast.success(message.change({x: customRole.getName()}));
        this.model = customRole;
        this.operation = OperationTypes.UPDATE;
      });
  }

  onGroupClicked(group: CheckGroup<Permission>): void {
    group.toggleSelection();
    this.updatePermissionFormField();
  }


  onPermissionClicked($event: Event, permission: Permission, group: CheckGroup<Permission>) {
    const checkBox = $event.target as HTMLInputElement;
    checkBox.checked ? group.addToSelection(Number(checkBox.value)) : group.removeFromSelection(Number(checkBox.value));
    checkBox.checked ? this.addToSelection(Number(checkBox.value)) : this.removeFromSelection(Number(checkBox.value));
    this.updatePermissionFormField();
  }

  static buildPermissionsByGroupId(permissions: Permission[]) {
    return permissions.reduce((acc, current) => {
      if (!acc.hasOwnProperty(current.groupId)) {
        acc[current.groupId] = [];
      }
      acc[current.groupId].push(current);
      return acc;
    }, {} as any);
  }

  private addToSelection(number: number) {
    this.selectedPermissions.push(number);
  }

  private removeFromSelection(number: number) {
    this.selectedPermissions.splice(this.selectedPermissions.indexOf(number), 1);
  }

  private updatePermissionFormField() {
    this.setSelectedPermissions();
    this.fm.getFormField('permissions')?.setValue(this.groups.some((group) => {
      return group.hasSelectedValue();
    }));
  }

  private setSelectedPermissions(): void {
    this.selectedPermissions = this.groups.reduce((acc, current) => {
      return acc.concat(current.getSelectedValue());
    }, [] as number[]);
  }
}
