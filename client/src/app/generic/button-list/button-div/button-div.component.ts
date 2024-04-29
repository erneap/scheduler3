import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-generic-list-button-div',
  templateUrl: './button-div.component.html',
  styleUrls: ['./button-div.component.scss']
})
export class ButtonDivComponent {
  private _label: string = '';
  private _id: string = '';
  private _selected: string = '';
  @Input() 
  public set label(lbl: string) {
    this._label = lbl;
  }
  get label(): string {
    return this._label;
  }
  @Input()
  public set id(id: string) {
    this._id = id;
  }
  get id(): string {
    return this._id;
  }
  @Input()
  public set selected(id: string) {
    this._selected = id;
  }
  get selected(): string {
    return this._selected;
  }
  @Output() select = new EventEmitter<string>()

  divStyle: string = "employee";

  onClick() {
    this.select.emit(this.id);
  }

  setStyle() {
    if (this.id.toLowerCase() === this.selected.toLowerCase()) {
      this.divStyle = "employee active";
    } else {
      this.divStyle = "employee";
    }
  }
}
