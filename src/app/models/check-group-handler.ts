import { CheckGroup } from '@app/models/check-group';
import { CustomMenu } from './custom-menu';

export class CheckGroupHandler<T extends { id: number }> {
  selection: number[] = [];

  constructor(private groups: CheckGroup<T>[], private onGroupClickedCallback?: Function, private onCheckBoxClickedCallback?: Function) {
  }

  getSelection(): number[] {
    return this.selection;
  }

  setSelection(selection: number[]): void {
    this.selection = selection;
    this.groups.forEach(group => group.setSelected(selection));
  }

  onGroupClicked(group: CheckGroup<T>): void {
    group.toggleSelection();
    this.updateSelection();
    this.onGroupClickedCallback && this.onGroupClickedCallback();
  }

  onCheckBoxClicked(item: T, { target }: Event, group: CheckGroup<T>): void {
    const menu = new CustomMenu().clone(item);
    let check = CheckGroupHandler.getCheckState(target);
    if (menu.isSystemParentItem()) {
      if (check) {
        this.checkAllChildren(menu, group);
        return;
      }
      this.unCheckAllChildren(menu, group);
      return;
    }
    check ? this.addToSelection(item, group) : this.removeFromSelection(item, group);
    this.onCheckBoxClickedCallback && this.onCheckBoxClickedCallback(item, check, group);
  }

  private unCheckAllChildren(menu: CustomMenu, group: CheckGroup<T>) {
    menu.getChildrenIds().forEach(id => {
      if (!this.selection.includes(id))
        return;
      const child = { id: id } as T;
      this.removeFromSelection(child, group);
    });
  }

  private checkAllChildren(menu: CustomMenu, group: CheckGroup<T>) {
    menu.getChildrenIds().forEach(id => {
      if (this.selection.includes(id))
        return;
      const child = { id: id } as T;
      this.addToSelection(child, group);
    });
  }

  static getCheckState(target: any): target is HTMLInputElement {
    return target ? target.checked : false;
  }

  private updateSelection(): void {
    this.selection = this.groups.reduce((acc, group) => acc.concat(group.getSelectedValue()), [] as number[]);
  }

  private addToSelection(item: T, group: CheckGroup<T>): void {
    if (!!item.id) {
      group.addToSelection(item.id);
      this.selection = this.selection.concat(item.id);
    }
  }

  forceSelectCheckbox(item: T, group: CheckGroup<T>): void {
    this.addToSelection(item, group);
  }

  private removeFromSelection(item: T, group: CheckGroup<T>): void {
    if (!!item.id) {
      group.removeFromSelection(item.id);
      this.selection.splice(this.selection.indexOf(item.id), 1);
    }

  }

  forceRemoveCheckbox(item: T, group: CheckGroup<T>): void {
    this.removeFromSelection(item, group);
  }

}
