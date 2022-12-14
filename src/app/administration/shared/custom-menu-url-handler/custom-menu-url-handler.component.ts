import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, UntypedFormControl} from '@angular/forms';
import {CustomMenu} from '@app/models/custom-menu';
import {LangService} from '@services/lang.service';
import {LookupService} from '@services/lookup.service';
import {CustomMenuService} from '@services/custom-menu.service';
import {CommonUtils} from '@helpers/common-utils';
import {DialogService} from '@services/dialog.service';
import {Lookup} from '@app/models/lookup';
import {CdkDrag, CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDropList, copyArrayItem} from '@angular/cdk/drag-drop';
import {ActionIconsEnum} from '@app/enums/action-icons-enum';
import {UserClickOn} from '@app/enums/user-click-on.enum';
import {MenuUrlValueContract} from '@contracts/menu-url-value-contract';
import {ToastService} from '@services/toast.service';

@Component({
  selector: 'custom-menu-url-handler',
  templateUrl: './custom-menu-url-handler.component.html',
  styleUrls: ['./custom-menu-url-handler.component.scss']
})
export class CustomMenuUrlHandlerComponent implements OnInit, AfterViewInit {
  @Input() record!: CustomMenu;
  @Input() readonly: boolean = false;
  actionIconsEnum = ActionIconsEnum;
  dropListIdInitials: string = 'dropList_' + new Date().valueOf() + '_';

  constructor(public lang: LangService,
              private fb: FormBuilder,
              private lookupService: LookupService,
              private dialogService: DialogService,
              private toast: ToastService,
              private customMenuService: CustomMenuService) {
  }

  ngOnInit(): void {
    this._buildForm();
  }

  ngAfterViewInit(): void {
    this.readonly ? this.menuUrlControl.disable() : this.menuUrlControl.enable();

    this.initUrlHandler();
  }

  form!: FormGroup;
  variableList: MenuUrlValueContract[] = [];
  menuParamsList: Lookup[] = this.lookupService.listByCategory.MenuItemParameters;
  displayedColumns: string[] = ['variable', 'variableValue'];

  private initUrlHandler(): void {
    this.variableList = this.record.urlParamsParsed;
    this.checkUrlVariables();
  }

  private _buildForm(): any {
    this.form = this.fb.group(this.record.buildMenuUrlForm(true));
  }

  isValidUrl(): boolean {
    const url = this.menuUrlControl.value;
    if (this.record.isParentMenu()) {
      // if no url, its valid
      if (!CommonUtils.isValidValue(url)) {
        return true;
      }
    } else {
      // children must have url
      if (!CommonUtils.isValidValue(url)) {
        return false;
      }
    }
    // menu should have valid url and valid variables too
    const variables = this.customMenuService.findVariablesInUrl(url);
    return this.menuUrlControl.valid && (!variables.length || this.isValidVariableList);
  }

  isTouchedOrDirty(): boolean {
    return this.form && (this.form.touched || this.form.dirty);
  }

  get isValidVariableList(): boolean {
    return this.variableList.every((item) => item.valueLookups.length > 0);
  }

  get menuUrlControl(): UntypedFormControl {
    return this.form.get('menuURL') as UntypedFormControl;
  }

  private _getDuplicateVariables(variableList: string[]): string[] {
    return variableList.map(x => x.toLowerCase()).filter((item: string, index: number, list: string[]) => {
      return list.indexOf(item) < index;
    });
  }

  checkUrlVariables(userInteraction: boolean = false): void {
    let newVariableList: string[] = this.customMenuService.findVariablesInUrl(this.menuUrlControl.value);
    if (userInteraction && !newVariableList.length) {
      this.toast.info(this.lang.map.msg_no_variables_found);
      return;
    }
    let duplicateVariablesList = this._getDuplicateVariables(newVariableList);
    if (duplicateVariablesList.length) {
      const listHtml = CommonUtils.generateHtmlList(this.lang.map.msg_duplicate_url_variables, duplicateVariablesList);
      this.dialogService.error(listHtml.outerHTML);
      return;
    }

    const existingVariableList = [...this.variableList];
    this.variableList = newVariableList.map((newVariable: string) => {
      const exisingVariable = existingVariableList.find(x => x.name.trim().toLowerCase() === newVariable.trim().toLowerCase());
      return <MenuUrlValueContract> {
        name: newVariable,
        value: exisingVariable ? exisingVariable.value : undefined,
        valueLookups: exisingVariable ? exisingVariable.valueLookups : []
      };
    });
  }

  /**
   * @description Get the list of id(s) of target lists to connect the source list
   */
  getConnectedListIds(): string[] {
    return this.variableList.map((item, index) => this.dropListIdInitials + index);
  }

  /**
   * @description Decides if dragged item can be dropped in given cdkDropList
   * @param item
   * @param dropList
   */
  canDropValue(item: CdkDrag<Lookup>, dropList: CdkDropList): boolean {
    return !dropList.data.length;
  }

  /**
   * @description When dragged item exits the source list, add a dummy item to the next index of dragged item (to fake the item in list to avoid resize)
   * @param event
   */
  onExitSourceList(event: CdkDragExit) {
    const currentIdx = event.container.data.findIndex((item: Lookup) => item.lookupKey === event.item.data.lookupKey);

    const replacementValue = new Lookup().clone({
      ...event.item.data,
      temp: true
    });
    this._addDummyItemToSourceList(currentIdx, replacementValue);
  }

  /**
   * @description When dragged item is brought back to source list, remove the dummy item as original item will take its place
   * @param event
   */
  onEnterSourceList(event: CdkDragEnter) {
    this._filterSourceList();
  }

  /**
   * @description Handles the drop event in target list.
   * After dragged item is dropped in target list, remove the dummy item from source list as original item will be available in source list after drop.So dummy item needs to be removed
   * @param event
   */
  drop(event: CdkDragDrop<Lookup[]>) {
    if (event.previousContainer !== event.container) {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    if (event.previousContainer.data) {
      this._filterSourceList();
    }
  }

  /**
   * @description Add the temporary/dummy item to source list
   *  Item will be added on next index. original index will get removed as soon as you exit the source list. (so, next index will become the current index)
   * @private
   */
  private _addDummyItemToSourceList(index: number, item: Lookup) {
    this.menuParamsList.splice(index + 1, 0, item);
  }

  /**
   * @description Filters the temporary/dummy items from source list
   * @private
   */
  private _filterSourceList() {
    this.menuParamsList = this.menuParamsList.filter((item: Lookup) => !item.temp);
  }

  /**
   * @description Delete the variable value
   * @param item
   */
  removeVariableValue(item: MenuUrlValueContract): void {
    if (!item.valueLookups || item.valueLookups.length === 0) {
      return;
    }
    this.dialogService.confirm(this.lang.map.msg_confirm_delete_x.change({x: item.valueLookups[0].getName()}))
      .onAfterClose$.subscribe((clickOn: UserClickOn) => {
      if (clickOn === UserClickOn.YES) {
        item.value = undefined;
        item.valueLookups = [];
      }
    });
  }
}
