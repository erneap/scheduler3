import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { DBReport, IDBReport } from 'src/app/models/reports/reportType';
import { DialogService } from 'src/app/services/dialog-service.service';

@Component({
    selector: 'app-report-archive-file',
    templateUrl: './report-archive-file.component.html',
    styleUrl: './report-archive-file.component.scss',
    standalone: false
})
export class ReportArchiveFileComponent {
  _report: DBReport = new DBReport();
  @Input()
  public set report(rpt: IDBReport) {
    this._report = new DBReport(rpt);
  }
  get report(): DBReport {
    return this._report;
  }

  constructor(
    protected dialogService: DialogService,
    private httpClient: HttpClient
  ) { }

  dateTime(): string {
    return ((this.report.reportdate.getMonth() < 9) ? "0" : "")
      + `${this.report.reportdate.getMonth() + 1}/`
      + ((this.report.reportdate.getDate() < 10) ? "0" : "")
      + `${this.report.reportdate.getDate()}/`
      + `${this.report.reportdate.getFullYear()} `
      + ((this.report.reportdate.getHours() < 10) ? "0" : "")
      + `${this.report.reportdate.getHours()}:`
      + ((this.report.reportdate.getMinutes() < 10) ? "0" : "")
      + `${this.report.reportdate.getMinutes()}`;
  }

  category(): string {
    if (this.report.subtype) {
      return this.report.subtype;
    }
    return "";
  }

  showReport() {
    const url = `/api/v2/general/report/${this.report.id}`;
    this.dialogService.showSpinner();
    this.httpClient.get(url, { responseType: "blob", observe: 'response'})
      .subscribe(file => {
        if (file.body) {
          const blob = new Blob([file.body],
            {type: 'application/vnd.openxmlformat-officedocument.spreadsheetml.sheet'});
            let contentDisposition = file.headers.get('Content-Disposition');
            let parts = contentDisposition?.split(' ');
            let fileName = '';
            parts?.forEach(pt => {
              if (pt.startsWith('filename')) {
                let fParts = pt.split('=');
                if (fParts.length > 1) {
                  fileName = fParts[1];
                }
              }
            });
            if (!fileName) {
              fileName = 'MsnSummary.xlsx';
            }
            const url = window.URL.createObjectURL(blob);
            
            const a: HTMLAnchorElement = document.createElement('a') as HTMLAnchorElement;
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
  
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.dialogService.closeSpinner();
        }
      })
  }
}
