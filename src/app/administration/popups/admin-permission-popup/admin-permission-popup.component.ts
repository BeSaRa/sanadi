import {AdminLookup} from '@models/admin-lookup';
import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {AdminLookupTypeEnum} from '@app/enums/admin-lookup-type-enum';
import {OperationTypes} from '@app/enums/operation-types.enum';
import {AdminGenericDialog} from '@app/generics/admin-generic-dialog';
import {IDialogData} from '@app/interfaces/i-dialog-data';
import {Lookup} from '@app/models/lookup';
import {Permission} from '@app/models/permission';
import {AdminLookupService} from '@app/services/admin-lookup.service';
import {LangService} from '@app/services/lang.service';
import {LookupService} from '@app/services/lookup.service';
import {ToastService} from '@app/services/toast.service';
import {DialogRef} from '@app/shared/models/dialog-ref';
import {DIALOG_DATA_TOKEN} from '@app/shared/tokens/tokens';
import {Observable} from 'rxjs';

@Component({
  selector: 'admin-permission-popup',
  templateUrl: 'admin-permission-popup.component.html',
  styleUrls: ['admin-permission-popup.component.scss']
})
export class AdminPermissionPopupComponent extends AdminGenericDialog<Permission> {

  categoryList: Lookup[] = this.lookupService.listByCategory.PermissionCategory;
  groupList: AdminLookup[] = [];
  form!: UntypedFormGroup;
  model!: Permission;
  operation: OperationTypes;
  saveVisible = true;
  readonly: boolean = false;

  constructor(public dialogRef: DialogRef,
              public fb: UntypedFormBuilder,
              public lang: LangService,
              @Inject(DIALOG_DATA_TOKEN) data: IDialogData<Permission>,
              private toast: ToastService,
              private lookupService: LookupService,
              private adminLookupService: AdminLookupService) {
    super();
    this.model = data.model;
    this.operation = data.operation;
  }

  initPopup(): void {
    this.adminLookupService.loadAsLookups(AdminLookupTypeEnum.PERMISSION_GROUP)
      .subscribe(lookups => {
        this.groupList = lookups;
      })
  }

  buildForm(): void {
    this.form = this.fb.group(this.model.buildForm(true));
    if (this.operation === OperationTypes.VIEW) {
      this.form.disable();
      this.saveVisible = false;
      this.validateFieldsVisible = false;
      this.readonly = true;
    }
  }

  beforeSave(model: Permission, form: UntypedFormGroup): Observable<boolean> | boolean {
    return form.valid;
  }

  prepareModel(model: Permission, form: UntypedFormGroup): Observable<Permission> | Permission {
    return (new Permission()).clone({...model, ...form.value});
  }

  afterSave(model: Permission, dialogRef: DialogRef): void {
    const message = this.operation === OperationTypes.CREATE ? this.lang.map.msg_create_x_success : this.lang.map.msg_update_x_success;
    this.toast.success(message.change({x: model.getName()}));
    this.model = model;
    this.operation = OperationTypes.UPDATE;
    dialogRef.close(model);
  }

  saveFail(error: Error): void {
  }

  get popupTitle(): string {
    if (this.operation === OperationTypes.CREATE) {
      return this.lang.map.lbl_add_permission;
    } else if (this.operation === OperationTypes.UPDATE) {
      return this.lang.map.lbl_edit_permission;
    } else if (this.operation === OperationTypes.VIEW) {
      return this.lang.map.view;
    }
    return '';
  };

  destroyPopup(): void {
  }


}
