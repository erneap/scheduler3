import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReportsService } from '../services/reports.service';
import { IReportTypeList, ReportType, ReportTypeList } from '../models/reports/reportType';
import { DialogService } from '../services/dialog-service.service';
import { AuthService } from '../services/auth.service';



@Component({
  selector: 'app-report-archive',
  templateUrl: './report-archive.component.html',
  styleUrl: './report-archive.component.scss'
})
export class ReportArchiveComponent {
  archiveForm: FormGroup;
  reportTypes: ReportType[];
  selectedReports: ReportType[];
  start: Date;
  end: Date;

  constructor(
    protected reportsService: ReportsService,
    protected dialogService: DialogService,
    protected authService: AuthService,
    private fb: FormBuilder
  ) {
    this.end = new Date();
    this.end = new Date(Date.UTC(this.end.getFullYear(), this.end.getMonth(), 
      this.end.getDate()) + (24 *3600000));
    this.start = new Date(this.end.getTime() - (30 * 24 * 3600000));
    const rtypes: string[] = new Array('schedule');
    this.archiveForm = this.fb.group({
      rptType: [rtypes, [Validators.required]],
      start: this.start,
      end: this.end,
    });
    this.dialogService.showSpinner();
    this.reportTypes = [];
    this.selectedReports = [];
    this.reportsService.getReportTypes().subscribe({
      next: (data: IReportTypeList) => {
        this.dialogService.closeSpinner();
        const list = new ReportTypeList(data);
        if (list.reporttypes) {
          list.reporttypes.forEach(rt => {
            this.reportTypes.push(new ReportType(rt));
          })
        }
        this.reportTypes.sort((a,b) => a.compareTo(b));
      },
      error: (err: IReportTypeList) => {
        this.dialogService.closeSpinner();
        if (err.exception) {
          this.authService.statusMessage = err.exception;
        }
      }
    })
  }

  onSelectType() {
    let rtypes = <string[]>this.archiveForm.controls["rptType"].value;
    let bAll = false;
    rtypes.forEach(rt => {
      if (rt.toLowerCase() === 'all') {
        bAll = true;
      }
    })
    if (bAll) {
      rtypes = [];
      this.reportTypes.forEach(rt => {
        rtypes.push(rt.name);
      });
      this.archiveForm.controls["rptType"].setValue(rtypes);
    }
  }

  setReportList() {
    this.selectedReports = [];
    let rTypeList: string[] = [];
    const rtypes = <string[]>this.archiveForm.controls["rptType"].value;
    const startDate = new Date(this.archiveForm.controls["start"].value);
    const endDate = new Date(this.archiveForm.controls["end"].value);
    rtypes.forEach(rt => {
      this.reportTypes.forEach(rtype => {
        if (rtype.name.toLowerCase() === rt.toLowerCase()) {
          rTypeList.push(rtype.id);
        }
      });
    });
    this.dialogService.showSpinner();
    this.reportsService.getReports(rTypeList, startDate, endDate).subscribe({
      next: (data: IReportTypeList) => {
        this.dialogService.closeSpinner();
        if (data.reporttypes) {
          data.reporttypes.forEach(rt => {
            const rtype = new ReportType(rt);
            if (rtype.reports) {
              rtype.reports.sort((a,b) => b.compareTo(a));
            }
            this.selectedReports.push(rtype);
          });
        }
      },
      error: (err: IReportTypeList) => {
        this.dialogService.closeSpinner();
        if (err.exception) {
          this.authService.statusMessage = err.exception;
        }
      }
    })
  }

  reportDate(dt: Date): string {
    const rptDate = new Date(dt);
    const months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec");
    return `${rptDate.getDate()} ${months[rptDate.getMonth()]} ${rptDate.getFullYear()}`;
  }
}
