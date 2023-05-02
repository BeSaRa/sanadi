import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormControl} from '@angular/forms';
import {ProjectComponent} from '@app/models/project-component';
import {LangService} from '@app/services/lang.service';
import {ToastService} from '@app/services/toast.service';
import {DialogService} from '@app/services/dialog.service';
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {ComponentType} from '@angular/cdk/portal';
import {IKeyValue} from '@app/interfaces/i-key-value';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {CommonUtils} from "@helpers/common-utils";
import {
  ComponentBudgetsPopupComponent
} from "@modules/services/project-models/popups/component-budgets-popup/component-budgets-popup.component";

@Component({
  selector: 'component-budgets',
  templateUrl: './component-budgets.component.html',
  styleUrls: ['./component-budgets.component.scss']
})
export class ComponentBudgetsComponent extends UiCrudListGenericComponent<ProjectComponent> implements OnInit {
  constructor(public lang: LangService,
              public fb: UntypedFormBuilder,
              public dialog: DialogService,
              public toast: ToastService) {
    super();
  }

  projectTotalCostField: UntypedFormControl = new UntypedFormControl();

  displayColumns: string[] = ['componentName', 'details', 'totalCost', 'actions'];
  footerColumns: string[] = ['totalComponentCostLabel', 'totalComponentCost'];
  actions: IMenuItem<ProjectComponent>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: ProjectComponent) => !this.readonly && this.edit$.next(item),
      show: (_item: ProjectComponent) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: ProjectComponent) => this.confirmDelete$.next(item),
      show: (_item: ProjectComponent) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: ProjectComponent) => this.view$.next(item),
    }
  ];

  protected _afterViewInit() {
    this._setProjectTotalCost();
  }

  _getNewInstance(override?: Partial<ProjectComponent> | undefined): ProjectComponent {
    return new ProjectComponent().clone(override ? override : {});
  }

  _getDialogComponent(): ComponentType<any> {
    return ComponentBudgetsPopupComponent;
  }

  _getDeleteConfirmMessage(record: ProjectComponent): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.componentName});
  }

  getExtraDataForPopup(): IKeyValue {
    return {};
  }

  afterReload() {
    this._setProjectTotalCost();
  }

  private _setProjectTotalCost(): void {
    this.projectTotalCostField.setValue(this._getTotalProjectComponentCost(2) ?? 0);
  }

  private _getTotalProjectComponentCost(numberOfDecimalPlaces: number = 2): number {
    if (!CommonUtils.isValidValue(this.list)) {
      return 0;
    }
    let total = this.list.filter(x => CommonUtils.isValidValue(x.totalCost))
      .map(t => t.totalCost)
      .reduce((a, b) => Number(Number(a).toFixed(numberOfDecimalPlaces)) + Number(Number(b).toFixed(numberOfDecimalPlaces)), 0) || 0;
    return Number(total.toFixed(numberOfDecimalPlaces));
  }
}
