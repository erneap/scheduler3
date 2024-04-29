import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ReportRequest } from 'src/app/models/web/teamWeb';
import { AuthService } from 'src/app/services/auth.service';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-report-mid-shift',
  templateUrl: './report-mid-shift.component.html',
  styleUrls: ['./report-mid-shift.component.scss']
})
export class ReportMidShiftComponent {
  @Input() reportType: string = ""

  constructor(
    protected authService: AuthService,
    protected dialogService: DialogService,
    protected siteService: SiteService,
    protected teamService: TeamService,
    protected http: HttpClient
  ) { }

  onSubmit() {
    const url = '/api/v2/scheduler/reports';
    const iTeam = this.teamService.getTeam();
    const iSite = this.siteService.getSite();
    if (iTeam && iSite) {
      
      const request: ReportRequest = {
        reportType: this.reportType,
        period: "",
        teamid: iTeam.id,
        siteid: iSite.id,
      };
      this.dialogService.showSpinner();
      this.http.post(url, request, { responseType: "blob", observe: 'response'})
        .subscribe(file => {
          if (file.body) {
            const blob = new Blob([file.body],
              {type: 'application/zip'});
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
                fileName = 'cofs.zip';
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
        });
    }
  }
}
