import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'select-by-color',
  templateUrl: './select-by-color.component.html',
  styleUrls: ['./select-by-color.component.scss']
})
export class SelectByColorComponent implements OnInit {
  @Input() XLabel: string = 'X';
  @Input() YLabel: string = 'Y';
  @Input() colors = ["#044C26", "#61845A", "#E0DB37", "#74251f", "#D62619"];
  @Output() change: EventEmitter<{ x: number, y: number }> = new EventEmitter();

  grid: string[][] = [];
  constructor() { }

  ngOnInit() {
    this.generateColorGrid()
  }
  generateColorGrid() {
    const gridSize = Math.ceil(this.colors.length / 2);
    for (let i = 0; i < gridSize; i++) {
      this.grid.push([]);
      for (let j = 0; j < gridSize; j++) {
        this.grid[i].push(this.colors[i + j])
      }
    }
  }
  select(selectedValue: { x: number, y: number }) {
    this.change.emit(selectedValue);
  }
}
