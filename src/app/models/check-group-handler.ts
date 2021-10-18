import {CheckGroup} from "@app/models/check-group";

export class CheckGroupHandler<T extends { id: number }> {
  selection: number[] = [];

  constructor(private groups: CheckGroup<T>[]) {
  }

  getSelection(): number[] {
    return this.selection;
  }

  onGroupClicked(group: CheckGroup<T>): void {
    group.toggleSelection();
    this.updateSelection();
  }

  onCheckBoxClicked(item: T, {target}: Event, group: CheckGroup<T>): void {
    let check = CheckGroupHandler.getCheckState(target);
    check ? this.addToSelection(item, group) : this.removeFromSelection(item, group);
  }

  static getCheckState(target: any): target is HTMLInputElement {
    return target ? target.checked : false;
  }

  private updateSelection(): void {
    this.selection = this.groups.reduce((acc, group) => acc.concat(group.getSelectedValue()), [] as number[])
  }

  private addToSelection(item: T, group: CheckGroup<T>): void {
    group.addToSelection(item.id);
    this.selection = this.selection.concat(item.id);
  }

  private removeFromSelection(item: T, group: CheckGroup<T>): void {
    group.removeFromSelection(item.id);
    this.selection.splice(this.selection.indexOf(item.id), 1);
  }

}
