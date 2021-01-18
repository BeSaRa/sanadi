import {Component, Inject, OnInit} from '@angular/core';
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
import {Lookup} from '../../../models/lookup';
import {combineLatest} from 'rxjs';
import {PermissionService} from '../../../services/permission.service';
import {take} from 'rxjs/operators';
import {Permission} from '../../../models/permission';
import {CheckGroup} from '../../../models/check-group';
import {CustomRolePermission} from '../../../models/custom-role-permission';

@Component({
  selector: 'app-custom-role-popup',
  templateUrl: './custom-role-popup.component.html',
  styleUrls: ['./custom-role-popup.component.scss']
})
export class CustomRolePopupComponent implements OnInit {
  form!: FormGroup;
  fm!: FormManager;
  operation: OperationTypes;
  model: CustomRole;
  permissions!: Record<number, Permission[][]>;
  selectedPermissions: number[] = [];
  groups: CheckGroup<Permission>[] = [];

  constructor(@Inject(DIALOG_DATA_TOKEN)  data: IDialogData<CustomRole>,
              private lookupService: LookupService,
              private fb: FormBuilder,
              private permissionService: PermissionService,
              public langService: LangService) {
    this.operation = data.operation;
    this.model = data.model;
    this.selectedPermissions = data.customRolePermissions.map((item: CustomRolePermission) => {
      return item.permissionId;
    });
  }

  ngOnInit(): void {
    this.buildGroups();
    this.buildForm();
  }

  private buildGroups() {
    combineLatest([this.permissionService.load(), this.lookupService.loadByCategory(LookupCategories.PERMISSION_GROUP)])
      .pipe(take(1))
      .subscribe((result) => {
        const permissionByGroupId = CustomRolePopupComponent.buildPermissionsByGroupId(result[0]);
        result[1].forEach((group: Lookup) => {
          this.groups.push(new CheckGroup<Permission>(group, permissionByGroupId[group.id], this.selectedPermissions, 3));
        });
      });
  }

  private buildForm(): void {
    this.form = this.fb.group({
      basic: this.fb.group({
        status: [this.model.status],
        arName: [this.model.arName, Validators.required],
        enName: [this.model.enName, Validators.required],
        description: [this.model.description],
      }, {validators: CustomValidators.validateFieldsStatus(['arName', 'enName'])}),
      permissions: [!!this.selectedPermissions.length, Validators.requiredTrue]
    });
    this.fm = new FormManager(this.form, this.langService);

    if (this.operation === OperationTypes.UPDATE) {
      this.fm.displayFormValidity();
    }
  }

  get popupTitle(): string {
    return this.operation === OperationTypes.CREATE ? this.langService.map.add_custom_role : this.langService.map.edit_custom_role;
  };


  saveModel(): void {

  }

  onGroupClicked(group: CheckGroup<Permission>): void {
    group.toggleSelection();
    this.updatePermissionFormField();
  }


  onPermissionClicked($event: Event, permission: Permission, group: CheckGroup<Permission>) {
    const checkBox = $event.target as HTMLInputElement;
    checkBox.checked ? group.addToSelection(Number(checkBox.value)) : group.removeFromSelection(Number(checkBox.value));
    checkBox.checked ? this.addToSelection(Number(checkBox.value)) : this.removeFromSelection(Number(checkBox.value));
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
    this.fm.getFormField('permissions')?.setValue(this.groups.some((group) => {
      return group.hasSelectedValue();
    }));
  }
}
