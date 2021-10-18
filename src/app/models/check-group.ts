import {Lookup} from './lookup';
import {chunk} from 'lodash';

export class CheckGroup<T extends { id: number }> {
  rows!: T[][];
  idList!: number[];

  constructor(public group: Lookup, private items: T[], private selected: number[] = [], chunkCount: number = 3) {
    this.getItemsId();
    this.filterSelection();
    this.updateChunkCount(chunkCount);
  }

  protected get length() {
    return this.items.length;
  }

  isFull(): boolean {
    return this.items.length === this.selected.length;
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
    this.selected = this.items.map(item => {
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
    // get items by id
    this.idList = this.items.map(item => {
      return item.id;
    });
  }

  isSelected(id: number): boolean {
    return this.selected.indexOf(id) !== -1;
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
