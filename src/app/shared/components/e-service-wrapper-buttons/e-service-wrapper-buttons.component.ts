import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {WrapperButtonsGroupEnum} from "@enums/wrapper-buttons-group-enum";
import {IMenuItem} from "@modules/context-menu/interfaces/i-menu-item";
import {CaseModel} from "@models/case-model";
import {EServicesGenericComponent} from "@app/generics/e-services-generic-component";
import {BaseGenericEService} from "@app/generics/base-generic-e-service";
import {delay, startWith, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {ILanguageKeys} from "@contracts/i-language-keys";
import {CommonUtils} from "@helpers/common-utils";
import {LangService} from "@services/lang.service";
import {ActionIconsEnum} from "@enums/action-icons-enum";

@Component({
  selector: 'e-service-wrapper-buttons',
  templateUrl: './e-service-wrapper-buttons.component.html',
  styleUrls: ['./e-service-wrapper-buttons.component.scss']
})
export class EServiceWrapperButtonsComponent implements OnInit, OnDestroy {
  private destroy$: Subject<any> = new Subject<any>();

  constructor(public lang: LangService) {
  }

  ngOnInit() {
    this.listenToTabChange();
  }

  @Input() model!: CaseModel<any, any>;
  @Input() component!: EServicesGenericComponent<CaseModel<any, any>, BaseGenericEService<CaseModel<any, any>>>;
  @Input() actions: IMenuItem<CaseModel<any, any>>[] = [];

  @Input() set actionsTrigger(value: boolean) {
    if (!value) {
      return;
    }
    this._groupActions();
  }

  @Output() actionCallback: EventEmitter<any> = new EventEmitter<any>();

  private buttonGroupLangKeys: { [key in WrapperButtonsGroupEnum]: (keyof ILanguageKeys | undefined) } = {
    [WrapperButtonsGroupEnum.ONE]: undefined,
    [WrapperButtonsGroupEnum.TWO]: 'btn_group_decision_actions',
    [WrapperButtonsGroupEnum.THREE]: 'btn_group_consultation_actions',
    [WrapperButtonsGroupEnum.FOUR]: undefined
  }

  wrapperButtonsGroupEnum = WrapperButtonsGroupEnum;
  actionIconsEnum = ActionIconsEnum;

  /**
   * @description Number of buttons to show before dropdown
   */
  buttonGroupCount: { [key in WrapperButtonsGroupEnum]: number } = {
    [WrapperButtonsGroupEnum.ONE]: 0,
    [WrapperButtonsGroupEnum.TWO]: 0,
    [WrapperButtonsGroupEnum.THREE]: 2,
    [WrapperButtonsGroupEnum.FOUR]: 0,
  }

  groupedActions: Map<WrapperButtonsGroupEnum, IMenuItem<CaseModel<any, any>>[]> =
    new Map<WrapperButtonsGroupEnum, IMenuItem<CaseModel<any, any>>[]>([
      [WrapperButtonsGroupEnum.ONE, []],
      [WrapperButtonsGroupEnum.TWO, []],
      [WrapperButtonsGroupEnum.THREE, []],
      [WrapperButtonsGroupEnum.FOUR, []],
    ]);

  private listenToTabChange(): void {
    this.component.componentTabsListRef.onTabChange
      .pipe(
        takeUntil(this.destroy$),
        startWith(null),
        delay(100)
      )
      .subscribe((activeTab) => {
        this._groupActions();
      })
  }

  private _hasValidButtonGroup(action: IMenuItem<CaseModel<any, any>>): boolean {
    return (CommonUtils.isValidValue(action.data)
      && CommonUtils.isValidValue(action.data!.buttonGroup)
      && Object.values(WrapperButtonsGroupEnum).includes(action.data!.buttonGroup)
    )
  }

  private _groupActions(): void {
    this.groupedActions.set(WrapperButtonsGroupEnum.ONE, []);
    this.groupedActions.set(WrapperButtonsGroupEnum.TWO, []);
    this.groupedActions.set(WrapperButtonsGroupEnum.THREE, []);
    this.groupedActions.set(WrapperButtonsGroupEnum.FOUR, []);

    this.actions.forEach(action => {
      if (!this._hasValidButtonGroup(action)) {
        if (!('data' in action)) {
          action.data = {};
        }
        action.data!.buttonGroup = WrapperButtonsGroupEnum.TWO;
        action.data!.groupOrder = action.data!.groupOrder ?? this.actions.length + 1; // setting the highest number for sort (same for all actions which don't have sortOrder defined)
      }

      if (!this.canHideByTabIndex(action)) {
        this.groupedActions.set(action.data!.buttonGroup, [...this.groupedActions.get(action.data!.buttonGroup)!, action]);
      }
    })
    for (let [key, value] of this.groupedActions) {
      this.groupedActions.set(key, value.sort((a: IMenuItem<CaseModel<any, any>>, b: IMenuItem<CaseModel<any, any>>) => {
        return (a.data!.groupOrder ?? 0) - (b.data!.groupOrder ?? 0)
      }));
    }
  }

  private canHideByTabIndex(action: IMenuItem<CaseModel<any, any>>): boolean {
    if (!action.data || !CommonUtils.isValidValue(action.data.hideByTabIndex)) {
      return false;
    }
    return action.data.hideByTabIndex();
  }

  actionButtonClass(action: IMenuItem<CaseModel<any, any>>, groupKey: WrapperButtonsGroupEnum, isDropdownItem: boolean): string {
    let classes = this._dropdownItemClasses(isDropdownItem);
    if (groupKey === WrapperButtonsGroupEnum.TWO) {
      classes += ' btn-primary';
    } else if (groupKey === WrapperButtonsGroupEnum.THREE) {
      classes += ' btn-success';
    }
    return classes;
    //return (!action.class ? '' : (typeof action.class === 'function' ? action.class(this.model) : action.class)) || '';
  }

  dropdownButtonClass(groupKey: WrapperButtonsGroupEnum): string {
    let classes = '';
    if (groupKey === WrapperButtonsGroupEnum.TWO) {
      classes += ' btn-primary';
    } else if (groupKey === WrapperButtonsGroupEnum.THREE) {
      classes += ' btn-success';
    }
    return classes;
  }

  getButtonGroupClass(groupKey: WrapperButtonsGroupEnum): string {
    return 'button-group-' + (groupKey + '');
  }

  getGroupDropdownButtonText(groupKey: WrapperButtonsGroupEnum): string {
    return !this.buttonGroupLangKeys[groupKey] ? 'Button Group ' + groupKey : (this.lang.map[this.buttonGroupLangKeys[groupKey]!] ?? '');
  }

  private _dropdownItemClasses(isDropdownItem: boolean): string {
    return (isDropdownItem ? 'dropdown-item br-0' : '');
  }

  isButtonGroupDropdownDisabled(groupKey: WrapperButtonsGroupEnum): boolean {
    const maxCount = this.buttonGroupCount[groupKey];
    // maxCount = 0 means, dropdown will not be visible. So, consider it disabled
    if (maxCount === 0) {
      return true;
    }
    // filter all actions greater than equal to maxCount before dropdown and enabled
    return (this.groupedActions.get(groupKey) ?? []).filter((item, index) => {
      return index >= maxCount && !this.isDisabled(item);
    }).length === 0;
  }

  isDisabled(action: IMenuItem<CaseModel<any, any>>): boolean {
    return !!(this.model && (typeof action.disabled === 'function' ? action.disabled(this.model!) : action.disabled));
  }

  onActionClick(action: IMenuItem<CaseModel<any, any>>) {
    this.actionCallback.emit(action);
  }

  ngOnDestroy(): void {
    this.destroy$.next('Destroy');
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
