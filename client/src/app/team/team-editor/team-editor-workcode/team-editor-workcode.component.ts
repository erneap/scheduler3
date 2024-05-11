import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Team } from 'src/app/models/teams/team';
import { Workcode } from 'src/app/models/teams/workcode';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-team-editor-workcode',
  templateUrl: './team-editor-workcode.component.html',
  styleUrls: ['./team-editor-workcode.component.scss']
})
export class TeamEditorWorkcodeComponent {
  @Input() width: number = 1200;
  @Input() height: number = 1200;
  @Input() team: Team = new Team();
  selected: Workcode = new Workcode();
  codeForm: FormGroup;

  constructor(
    protected teamService: TeamService,
    private fb: FormBuilder
  ) {
    this.codeForm = this.fb.group({
      id: ['', [Validators.required]],
      title: ['', [Validators.required]],
      start: 0,
      shiftCode: 0,
      altcode: '',
      search: '',
      isleave: false,
      textcolor: '000000',
      backcolor: 'ffffff',
    })
    this.setWorkcode();
  }

  viewStyle(): string {
    return `width: ${this.width}px;height: ${this.height}px;`;
  }

  itemClass(id: string): string {
    if (id === this.selected.id) {
      return 'item selected';
    }
    return 'item';
  }

  spanStyle(wc: Workcode): string {
    return `background-color: #${wc.backcolor};color: #${wc.textcolor};`;
  }

  onSelect(id: string) {
    if (id === '') {
      this.selected = new Workcode();
    } else {
      this.team.workcodes.forEach(wc => {
        if (wc.id === id) {
          this.selected = new Workcode(wc);
        }
      });
    }
    this.setWorkcode();
  }

  setWorkcode() {
    this.codeForm.controls['id'].setValue(this.selected.id);
    /*
    this.codeForm.controls['title'].setValue(this.selected.title);
    this.codeForm.controls['start'].setValue(this.selected.start);
    this.codeForm.controls['shiftcode'].setValue(this.selected.shiftCode);
    this.codeForm.controls['altcode'].setValue(this.selected.altcode);
    this.codeForm.controls['search'].setValue(this.selected.search);
    this.codeForm.controls['isleave'].setValue(this.selected.isLeave);
    this.codeForm.controls['textcolor'].setValue(this.selected.textcolor);
    this.codeForm.controls['backcolor'].setValue(this.selected.backcolor);*/
  }
}
