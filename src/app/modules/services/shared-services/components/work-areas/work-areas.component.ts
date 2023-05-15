import { Component, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ListModelComponent } from '@app/generics/ListModel-component';
import { CommonUtils } from '@helpers/common-utils';
import { SortEvent } from '@contracts/sort-event';
import { Country } from '@models/country';
import { WorkArea } from '@models/work-area';
import { LangService } from '@services/lang.service';
import { ComponentType } from '@angular/cdk/portal';
import { WorkAreasPopupComponent } from '../../popups/work-areas-popup/work-areas-popup.component';
import {ActionIconsEnum} from "@enums/action-icons-enum";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {UiCrudListGenericComponent} from "@app/generics/ui-crud-list-generic-component";
import {DialogService} from "@services/dialog.service";
import {ToastService} from "@services/toast.service";
import {IKeyValue} from "@contracts/i-key-value";
import {Bylaw} from "@models/bylaw";

@Component({
  selector: 'work-areas',
  templateUrl: './work-areas.component.html',
  styleUrls: ['./work-areas.component.scss']
})
export class WorkAreasComponent extends UiCrudListGenericComponent<WorkArea> {
  constructor(public lang: LangService,
              public dialog: DialogService,
              public toast: ToastService
              ) {
    super();
  }
  @Input() countries: Country[] = [];

  actions: IMenuItem<WorkArea>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: WorkArea) => this.edit$.next(item),
      show: (_item: WorkArea) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: WorkArea) => this.confirmDelete$.next(item),
      show: (_item: WorkArea) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: WorkArea) => this.view$.next(item),
    }
  ];
  displayColumns: string[] = ['country', 'region','actions'];
  sortingCallbacks = {
    country: (a: WorkArea, b: WorkArea, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.countryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.countryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }

  _getDeleteConfirmMessage(record: WorkArea): string {
    return this.lang.map.msg_confirm_delete_x.change({x: record.countryInfo.getName()});
  }

  _getDialogComponent(): ComponentType<any> {
    return WorkAreasPopupComponent;
  }

  _getNewInstance(override: Partial<WorkArea> | undefined): WorkArea {
    return new WorkArea().clone(override ?? {});
  }

  getExtraDataForPopup(): IKeyValue {
    return {
      countries: this.countries
    };
  }


  /*protected _getPopupComponent(): ComponentType<any> {
    return WorkAreasPopupComponent;
  }
  get list() {
    return this._list;
  }
  @Input() set list(_list: WorkArea[]) {
    this._list = _list;
  }
  @Input() countries: Country[] = [];
  @Input() readonly!: boolean;
  form!: UntypedFormGroup;
  filterControl: UntypedFormControl = new UntypedFormControl('');

  columns = ['country', 'region','actions'];
  sortingCallbacks = {
    country: (a: WorkArea, b: WorkArea, dir: SortEvent): number => {
      let value1 = !CommonUtils.isValidValue(a) ? '' : a.countryInfo.getName().toLowerCase(),
        value2 = !CommonUtils.isValidValue(b) ? '' : b.countryInfo.getName().toLowerCase();
      return CommonUtils.getSortValue(value1, value2, dir.direction);
    },
  }
  constructor(private fb: UntypedFormBuilder, public lang: LangService) {
    super(WorkArea);
  }
  protected _initComponent(): void {
    this.form = this.fb.group(this.model.buildForm());
    this.customData = {
      countries: this.countries
    }
  }
  forceClearComponent() {
    this.cancel();
    this.list = [];
  }

  actions: IMenuItem<WorkArea>[] = [
    // edit
    {
      type: 'action',
      icon: ActionIconsEnum.EDIT,
      label: 'btn_edit',
      onClick: (item: WorkArea) => this.selectOne(item),
      show: (_item: WorkArea) => !this.readonly
    },
    // delete
    {
      type: 'action',
      icon: ActionIconsEnum.DELETE,
      label: 'btn_delete',
      onClick: (item: WorkArea) => this.removeOne(item),
      show: (_item: WorkArea) => !this.readonly
    },
    // view
    {
      type: 'action',
      icon: ActionIconsEnum.VIEW,
      label: 'view',
      onClick: (item: WorkArea) => this.selectOne(item),
    }
  ];*/
}
