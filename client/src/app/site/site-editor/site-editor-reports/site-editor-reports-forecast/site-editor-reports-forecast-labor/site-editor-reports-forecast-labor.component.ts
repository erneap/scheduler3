import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ListItem } from 'src/app/generic/button-list/listitem';
import { DeletionConfirmationComponent } from 'src/app/generic/deletion-confirmation/deletion-confirmation.component';
import { ForecastReport, IForecastReport } from 'src/app/models/sites/forecastreport';
import { LaborCode } from 'src/app/models/sites/laborcode';
import { Site } from 'src/app/models/sites/site';
import { SiteResponse } from 'src/app/models/web/siteWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-site-editor-reports-forecast-labor',
  templateUrl: './site-editor-reports-forecast-labor.component.html',
  styleUrls: ['./site-editor-reports-forecast-labor.component.scss']
})
export class SiteEditorReportsForecastLaborComponent {
  private _report: ForecastReport = new ForecastReport();
  @Input()
  public set report(r: IForecastReport) {
    this._report = new ForecastReport(r);
    this.setLaborCodes();
    if (this._report.laborCodes && this._report.laborCodes.length > 0) {
      this.selected = new LaborCode(this._report.laborCodes[0]);
      this.setLaborCode();
    }
  }
  get report(): ForecastReport {
    return this._report;
  }
  @Input() siteid: string = '';
  @Input() teamid: string = '';
  @Input() width: number = 350;
  @Output() changed = new EventEmitter<Site>();
  laborcodes: ListItem[] = [];
  selected: LaborCode;
  laborForm: FormGroup;

  constructor(
    protected authService: AuthService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected dialogService: DialogService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.selected = new LaborCode();
    this.selected.chargeNumber = 'new';
    this.selected.extension = 'new';
    const isite = this.siteService.getSite();
    if (isite) {
      this.siteid = isite.id;
    }
    const iteam = this.teamService.getTeam();
    if (iteam) {
      this.teamid = iteam.id;
    }
    this.laborForm = this.fb.group({
      chargenumber: ['', [Validators.required]],
      extension: ['', [Validators.required]],
      clin: '',
      slin: '',
      location: '',
      wbs: '',
      minimum: 1,
      notAssignedName: 'VACANT',
      hoursPerEmployee: 1824,
      exercise: false,
      startDate: [this.report.startDate, [Validators.required]],
      endDate: [this.report.endDate, [Validators.required]],
    });
    this.setLaborCode();
  }

  setLaborCodes() {
    this.laborcodes = [];
    this.laborcodes.push(new ListItem('new-new', 'Add new Labor Code'));
    if (this.report.laborCodes) {
      this.report.laborCodes.sort((a,b) => a.compareTo(b));
      this.report.laborCodes.forEach(lc => {
        const label = `${lc.chargeNumber}-${lc.extension}`;
        this.laborcodes.push(new ListItem(label, label));
      });
    }
  }

  setItemClass(id: string): string {
    let parts = id.split("-");
    if (this.selected.chargeNumber === parts[0] 
      && this.selected.extension === parts[1]) {
      return 'item selected';
    }
    return 'item';
  }

  onSelectLaborCode(id: string) {
    const parts = id.split("-");
    this.selected = new LaborCode();
    this.selected.chargeNumber = 'new';
    this.selected.extension = 'new';
    this.selected.startDate = new Date(this.report.startDate);
    this.selected.endDate = new Date(this.report.endDate);
    if (this.report.laborCodes) {
      this.report.laborCodes.forEach(lc => {
        if (parts[0] === lc.chargeNumber && parts[1] === lc.extension) {
          this.selected = new LaborCode(lc);
        }
      });
    }
    this.setLaborCode();
  }

  setLaborCode() {
    if (this.selected.chargeNumber === 'new') {
      let first = undefined;
      if (this.report.laborCodes && this.report.laborCodes.length > 0) {
        first = this.report.laborCodes[0];
      }
      this.laborForm.controls['extension'].setValue('');
      if (first) {
        this.laborForm.controls['chargenumber'].setValue(first.chargeNumber);
        this.laborForm.controls['clin'].setValue(first.clin);
        this.laborForm.controls['slin'].setValue(first.slin);
        this.laborForm.controls['wbs'].setValue(first.wbs);
        this.laborForm.controls['location'].setValue(first.location);
        this.laborForm.controls['minimum'].setValue(1);
        this.laborForm.controls['notAssignedName'].setValue('Empty');
        this.laborForm.controls['hoursPerEmployee'].setValue(1824);
        this.laborForm.controls['exercise'].setValue(false);
        this.laborForm.controls['startDate'].setValue(
          new Date(first.startDate));
        this.laborForm.controls['endDate'].setValue(
          new Date(first.endDate));
      } else {
        this.laborForm.controls['chargenumber'].setValue('');
        this.laborForm.controls['clin'].setValue(this.selected.clin);
        this.laborForm.controls['slin'].setValue(this.selected.slin);
        this.laborForm.controls['wbs'].setValue(this.selected.wbs);
        this.laborForm.controls['location'].setValue(this.selected.location);
        this.laborForm.controls['minimum'].setValue(this.selected.minimumEmployees);
        this.laborForm.controls['notAssignedName'].setValue(
          this.selected.notAssignedName);
        this.laborForm.controls['hoursPerEmployee'].setValue(
          this.selected.hoursPerEmployee);
        this.laborForm.controls['exercise'].setValue(this.selected.exercise);
        this.laborForm.controls['startDate'].setValue(
          new Date(this.selected.startDate));
        this.laborForm.controls['endDate'].setValue(
          new Date(this.selected.endDate));
      }
    } else {
      this.laborForm.controls['chargenumber'].setValue(
        this.selected.chargeNumber);
      this.laborForm.controls['extension'].setValue(this.selected.extension);
      this.laborForm.controls['clin'].setValue(this.selected.clin);
      this.laborForm.controls['slin'].setValue(this.selected.slin);
      this.laborForm.controls['wbs'].setValue(this.selected.wbs);
      this.laborForm.controls['location'].setValue(this.selected.location);
      this.laborForm.controls['minimum'].setValue(this.selected.minimumEmployees);
      this.laborForm.controls['notAssignedName'].setValue(
        this.selected.notAssignedName);
      this.laborForm.controls['hoursPerEmployee'].setValue(
        this.selected.hoursPerEmployee);
      this.laborForm.controls['exercise'].setValue(this.selected.exercise);
      this.laborForm.controls['startDate'].setValue(
        new Date(this.selected.startDate));
      this.laborForm.controls['endDate'].setValue(
        new Date(this.selected.endDate));
    }
  }

  setLaborInputStyle(field: string): string {
    if (this.laborForm.controls[field].hasError('required')) {
      return "width: 99%;background-color: pink;";
    }
    return "width: 99%;background-color: white;";
  }
 
  getDateString(date: Date): string {
    date = new Date(date);
    let answer = `${date.getFullYear()}-`;
    if (date.getMonth() < 9) {
      answer += '0';
    }
    answer += `${date.getMonth() + 1}-`;
    if (date.getDate() < 10) {
      answer += '0';
    }
    answer += `${date.getDate()}`;
    return answer;
  }

  onAddLaborCode() {
    const chgNo = this.laborForm.value.chargenumber;
    const ext = this.laborForm.value.extension;
    const startDate = this.laborForm.value.startDate;
    const endDate = this.laborForm.value.endDate;
    const mins = this.laborForm.value.minimum;

    this.dialogService.showSpinner();
    this.siteService.createReportLaborCode(this.teamid, this.siteid, 
      this.report.id, chgNo, ext, this.laborForm.value.clin, 
      this.laborForm.value.slin, this.laborForm.value.wbs, 
      this.laborForm.value.location, mins,
      this.laborForm.value.hoursPerEmployee, this.laborForm.value.notAssignedName,
      this.laborForm.value.exercise, this.getDateString(startDate), 
      this.getDateString(endDate)).subscribe({
      next: (data: SiteResponse) => {
        this.dialogService.closeSpinner();
        if (data && data != null && data.site) {
          const site = new Site(data.site);
          this.changed.emit(new Site(data.site));
          if (site.forecasts) {
            site.forecasts.forEach(rpt => {
              if (rpt.id === this.report.id) {
                this.report = rpt;
                this.onSelectLaborCode(`${chgNo}-${ext}`);
                this.setLaborCode();
              }
            });
          }
        }
      },
      error: (err: SiteResponse) => {
        this.dialogService.closeSpinner();
        this.authService.statusMessage = err.exception;
      }
    });
  }

  onClear() {
    this.setLaborCode();
  }

  onUpdateLaborCode(field: string) {
    if (this.selected.chargeNumber !== 'new') {
      let value: string = '';
      switch (field.toLowerCase()) {
        case "minimum":
          value = (Math.round(this.laborForm.controls[field].value * 100) 
            / 100).toFixed(0);
          break;
        case "hoursperemployee":
          value = (Math.round(this.laborForm.controls[field].value * 100) 
            / 100).toFixed(1);
          break;
        case "exercise":
          value = (this.laborForm.controls[field].value) ? "true" : "false";
          break;
        case "startdate":
        case "enddate":
          const tdate: Date = this.laborForm.controls[field].value
          value = this.getDateString(tdate);
          break;
        default:
          value = this.laborForm.controls[field].value;
          break;
      }
      const chgNo = this.laborForm.value.chargeNumber;
      const ext = this.laborForm.value.extension;

     if (value !== '') {
        this.dialogService.showSpinner();
        this.siteService.updateReportLaborCode(this.teamid, this.siteid, 
          this.report.id, chgNo, ext, field, value).subscribe({
          next: (data: SiteResponse) => {
            this.dialogService.closeSpinner();
            if (data && data != null && data.site) {
              const site = new Site(data.site);
              this.changed.emit(new Site(data.site));
              if (site.forecasts) {
                site.forecasts.forEach(rpt => {
                  if (rpt.id === this.report.id) {
                    this.report = rpt;
                    this.setLaborCode();
                  }
                });
              }
            }
          },
          error: (err: SiteResponse) => {
            this.dialogService.closeSpinner();
            this.authService.statusMessage = err.exception;
          }
        });
      }
    }
  }

  onDeleteLaborCode() {
    if (this.selected.chargeNumber !== 'new') {
      const chgNo = this.laborForm.value.chargeNumber;
      const ext = this.laborForm.value.extension;
      const dialogRef = this.dialog.open(DeletionConfirmationComponent, {
        data: {title: 'Confirm Labor Code Deletion', 
        message: 'Are you sure you want to delete this Labor Code?'},
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.authService.statusMessage = "Deleting CofS Report";
          this.dialogService.showSpinner();
          this.siteService.updateForecastReport(this.teamid, this.siteid, 
            this.report.id, "deletelabor", `${chgNo}|${ext}`).subscribe({
              next: (data: SiteResponse) => {
                if (data && data != null && data.site) {
                  const site = new Site(data.site);
                  this.changed.emit(new Site(data.site));
                  if (site.forecasts) {
                    site.forecasts.forEach(rpt => {
                      if (rpt.id === this.report.id) {
                        this.report = rpt;
                        this.selected = new LaborCode();
                        this.selected.chargeNumber = 'new';
                        this.selected.extension = 'new';
                        this.setLaborCode();
                      }
                    })
                  }
                }
              },
              error: (err: SiteResponse) => {
                this.dialogService.closeSpinner();
              this.authService.statusMessage = err.exception;
              }
            });
        }
      });
    }
  }
}
