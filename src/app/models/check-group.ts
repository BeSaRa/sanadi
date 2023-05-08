import {Lookup} from './lookup';
import {chunk} from 'lodash';

export class CheckGroup<T extends { id: number }> {
  rows!: T[][];
  idList!: number[];

  constructor(public group: Lookup, private items: T[], private selected: number[] = [], chunkCount: number = 3, private containsEmptyChunkItems: boolean = false) {
    this.getItemsId();
    this.filterSelection();
    this.updateChunkCount(chunkCount);
  }

  protected get length() {
    return this.list.length;
  }

  get list(): T[] {
    let list: T[] = this.items;
    if (this.containsEmptyChunkItems) {
      list = this.items.filter(x => !!x.id);
    }
    return list;
  }

  isFull(): boolean {
    // console.log(this.list);
    // console.log(this.selected);

    return this.list.length === this.selected.length;
  }

  isEmpty(): boolean {
    return !this.selected.length;
  }

  isIndeterminate(): boolean {
    return !this.isEmpty() && !this.isFull();
  }

  addToSelection(id: number): void {
    this.selected.push(id);
  }

  removeFromSelection(id: number): void {
    this.selected.splice(this.selected.indexOf(id), 1);
  }

  selectAll(): void {
    this.selected = this.list.map(item => {
      return item.id;
    });
  }

  deSelectAll(): void {
    this.selected = [];
  }

  setSelected(selected: number[]): void {
    this.selected = selected;
    this.filterSelection();
  }

  updateChunkCount(chunkCount: number): void {
    this.rows = chunk(this.items, chunkCount);
  }

  private filterSelection(): void {
    // filter selected
    this.selected = this.selected.filter((id) => {
      return this.idList.indexOf(id) !== -1;
    });
  }

  private getItemsId(): void {
    // get items id
    this.idList = this.list.map(item => {
      return item.id;
    });
  }

  isSelected(id: number): boolean {
    return this.selected.indexOf(id) !== -1;
  }
  isChildrenSelected(childrenIds:number[]): boolean {
    return childrenIds.every(x=>this.selected.indexOf(x) !== -1)
  }

  toggleSelection(): void {
    if (this.isEmpty() || this.isIndeterminate()) {
      this.selected = this.idList.slice();
    } else {
      this.selected = [];
    }
  }

  hasSelectedValue(): boolean {
    return !!this.selected.length;
  }

  getSelectedValue(): number[] {
    return this.selected.slice();
  }
}
