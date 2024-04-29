import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportRequest } from 'src/app/models/web/teamWeb';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-report-schedule',
  templateUrl: './report-schedule.component.html',
  styleUrls: ['./report-schedule.component.scss']
})
export class ReportScheduleComponent {
  @Input() reportType: string = '';
  reportForm: FormGroup;

  constructor(
    protected teamService: TeamService,
    protected siteService: SiteService,
    protected dialogService: DialogService,
    protected httpClient: HttpClient,
    private fb: FormBuilder
  ){
    this.reportForm = this.fb.group({
      year: (new Date()).getFullYear(),
    });
  }

  onSubmit() {
    const url = '/api/v2/scheduler/reports';
    const iTeam = this.teamService.getTeam();
    const iSite = this.siteService.getSite();
    if (iTeam && iSite) {
      const request: ReportRequest = {
        reportType: 'schedule',
        period: `${this.reportForm.value.year}`,
        teamid: iTeam.id,
        siteid: iSite.id
      };
      this.dialogService.showSpinner();
      this.httpClient.post(url, request, { responseType: "blob", observe: 'response'})
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
}
