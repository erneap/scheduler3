import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ListItem } from './listitem';

@Component({
  selector: 'app-generic-button-list',
  templateUrl: './button-list.component.html',
  styleUrls: ['./button-list.component.scss']
})
export class ButtonListComponent {
  private _items: ListItem[] = [];
  private _selected: string = '';
  private _width: number = 260;
  private _minheight: number = 500;
  @Input()
  public set items(its: ListItem[]) {
    this._items = its;
  }
  get items(): ListItem[] {
    return this._items;
  }
  @Input()
  public set selected(id: string) {
    this._selected = id;
  }
  get selected(): string {
    return this._selected;
  }
  @Input()
  public set width(w: number) {
    this._width = w;
    this.setStyle();
  }
  get width(): number {
    return this._width;
  }
  @Input()
  public set minheight(h: number) {
    this._minheight = h;
    this.setStyle();
  }
  get minheight(): number {
    return this._minheight;
  }
  @Output() select = new EventEmitter<string>();

  listStyle = 'width:250px;min-height:500px;';

  setStyle() {
    this.listStyle = `width: ${this.width}px;min-height:${this.minheight}px;`;
  }

  onSelect(eid: string) {
    this.select.emit(eid);
  }
}
