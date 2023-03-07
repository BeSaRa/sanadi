import {Component, Input, OnInit, TemplateRef, ViewEncapsulation} from '@angular/core';
import {IMenuItem} from '@app/modules/context-menu/interfaces/i-menu-item';
import {LangService} from '@app/services/lang.service';
import {ILanguageKeys} from '@app/interfaces/i-language-keys';
import {BehaviorSubject} from 'rxjs';

@Component({
  selector: 'grid-actions',
  templateUrl: './grid-actions.component.html',
  styleUrls: ['./grid-actions.component.scss']
})
export class GridActionsComponent implements OnInit {
  filteredActions: IMenuItem<any>[] = [];
  private _record: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  @Input() actions: IMenuItem<any>[] = [];
  @Input() itemIndex: number = -1;

  @Input()
  set record(value: any) {
    this._record.next(value);
  }

  get record(): any {
    return this._record.value;
  }

  constructor(public lang: LangService) {
  }

  ngOnInit(): void {
    this.onRecordChange()
  }

  isAction(action: IMenuItem<any>): boolean {
    return action.type === 'action';
  }

  isDivider(action: IMenuItem<any>): boolean {
    return action.type === 'divider';
  }

  hasChildren(action: IMenuItem<any>): boolean {
    return this.isAction(action) && !!action.children && action.children.length > 0;
  }

  displayLabel(action: IMenuItem<any>): string {
    return typeof action.label === 'function' ? action.label(this.record) : this.lang.map[action.label as unknown as keyof ILanguageKeys];
  }

  onClick(event: MouseEvent, action: IMenuItem<any>) {
    event.preventDefault();
    if (this.isActionDisabled(action)) {
      return;
    }
    action.onClick && action.onClick(this.record, this.itemIndex);
  }

  private _filterActionsArray(actions: IMenuItem<any>[], record: any): IMenuItem<any>[] {
    let childActions: IMenuItem<any>[] = [];
    actions.map((action, index, actions) => {
      if (this.isDivider(action)) {
        let previousItem = childActions[index - 1];
        if (previousItem && !this.isDivider(previousItem)) {
          childActions.push(action);
        }
      }
      if (this._filterAction(action, record)) {
        childActions.push(action);
      }
    });
    return childActions;
  }

  private _filterAction(action: IMenuItem<any>, record: any): boolean {
    if ('displayInGrid' in action && !action.displayInGrid) {
      return false;
    }
    console.log(action.show!(record))
    return !action.show || (action.show && action.show(record));
  }

  /**
   * @description Filters the actions to show/hide depending on (displayInGrid and show) status
   * If action has children, show/hide status of children will decide the show/hide of parent action
   * @private
   */
  private _filterActions(): IMenuItem<any>[] {
    if (!this.record || this.actions.length === 0) {
      return [];
    }
    let actionsList: IMenuItem<any>[] = [];
    this.actions.map((action, index, actions) => {
      if (this.isDivider(action)) {
        let previousItem = actionsList[actionsList.length - 1];
        if (previousItem && !this.isDivider(previousItem)) {
          actionsList.push(action);
        }
      } else if (this.isAction(action)) {
        // filter children; if filtered children has actions, show main action
        if (action.children && action.children.length > 0) {
          let filteredChildren = this._filterActionsArray(action.children, this.record);
          if (filteredChildren.length > 0) {
            action.children = filteredChildren;
            actionsList.push(action);
          }
        } else {
          console.log(this._filterAction(action, this.record))
          if (this._filterAction(action, this.record)) {
            actionsList.push(action);
          }
        }
      }
      return action;
    });
    return actionsList;
  }

  /**
   * @description Checks if action is disabled
   * If action has children, disable status of children will decide the disabled of parent action
   * @param action
   */
  isActionDisabled(action: IMenuItem<any>): boolean {
    if (this.hasChildren(action)) {
      return !!(action.children?.every(item => this.isActionDisabled(item)));
    }

    return action.disabled ? (typeof action.disabled === 'function' ? action.disabled(this.record) : action.disabled) : false;
  }

  private onRecordChange() {
    this._record.subscribe(() => {
      this.filteredActions = this._filterActions();
    })
  }
}
