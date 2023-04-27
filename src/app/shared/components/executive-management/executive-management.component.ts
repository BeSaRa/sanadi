import { Lookup } from '@models/lookup';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActionIconsEnum } from '@app/enums/action-icons-enum';
import { UserClickOn } from '@app/enums/user-click-on.enum';
import { CommonUtils } from '@helpers/common-utils';
import { ILanguageKeys } from '@contracts/i-language-keys';
import { SortEvent } from '@contracts/sort-event';
import { AdminResult } from '@app/models/admin-result';
import { Country } from '@app/models/country';
import { ExecutiveManagement } from '@app/models/executive-management';
import { IMenuItem } from '@app/modules/context-menu/interfaces/i-menu-item';
import { DialogService } from '@services/dialog.service';
import { LangService } from '@services/lang.service';
import { ToastService } from '@services/toast.service';
import { ReadinessStatus } from '@app/types/types';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { ExecutiveManagementPopupComponent } from '../../popups/executive-management-popup/executive-management-popup.component';
import { UiCrudListGenericComponent } from '@app/generics/ui-crud-list-generic-component';
import { ComponentType } from '@angular/cdk/portal';
import { IKeyValue } from '@app/interfaces/i-key-value';

@Component({
  selector: 'executive-management',
  templateUrl: './executive-management.component.html',
  styleUrls: ['./executive-management.component.scss']
})
export class ExecutiveManagementComponent extends UiCrudListGenericComponent<ExecutiveManagement> {
  actions: IMenuItem<ExecutiveManagement>[] = [
      {
        type: 'action',
        icon: ActionIconsEnum.EDIT,
        label: 'btn_edit',
        onClick: (item: ExecutiveManagement) => this.edit$.next(item),
        show: (_item: ExecutiveManagement) => !this.readonly
      },
      {
        type: 'action',
        icon: ActionIconsEnum.DELETE,
        label: 'btn_delete',
        onClick: (item: ExecutiveManagement) => this.confirmDelete$.next(item),
        show: (_item: ExecutiveManagement) => !this.readonly
      },
      {
        type: 'action',
        icon: ActionIconsEnum.VIEW,
        label: 'view',
        onClick: (item: ExecutiveManagement) => this.view$.next(item),
      }
    ];
  displayColumns: string[]=['arabicName', 'englishName', 'email', 'passportNumber', 'actions'];

  _getNewInstance(override?: Partial<ExecutiveManagement> | undefined): ExecutiveManagement {
    return new ExecutiveManagement().clone(override ?? {});
  }
  _getDialogComponent(): ComponentType<any> {
    return ExecutiveManagementPopupComponent
  }
  _getDeleteConfirmMessage(record: ExecutiveManagement): string {
    return this.lang.map.msg_confirm_delete_x;
  }
  getExtraDataForPopup(): IKeyValue {
    return {
      pageTitle: this.pageTitleKey,
      hidePassport: this.hidePassport
    };
  }
  @Input() executiveManagementDTOsList: ExecutiveManagement[] =[];
  @Input() hidePassport: boolean = false;
  @Input() pageTitleKey: keyof ILanguageKeys = 'managers';

  constructor(public lang: LangService,
    public toast: ToastService,
    public dialog: DialogService) {
  super();
  }
}
