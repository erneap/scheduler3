import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Company } from 'src/app/models/teams/company';
import { ReportRequest } from 'src/app/models/web/teamWeb';
import { DialogService } from 'src/app/services/dialog-service.service';
import { SiteService } from 'src/app/services/site.service';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-report-charge-number',
  templateUrl: './report-charge-number.component.html',
  styleUrls: ['./report-charge-number.component.scss']
})
export class ReportChargeNumberComponent {
  @Input() reportType: string = '';
  reportForm: FormGroup;
  companyList: Company[];

  constructor(
    protected teamService: TeamService,
    protected siteService: SiteService,
    protected dialogService: DialogService,
    protected httpClient: HttpClient,
    private fb: FormBuilder
  ){
    const team = this.teamService.getTeam()
    this.companyList = [];
    if (team) {
      team.companies.forEach(co => {
        this.companyList.push(new Company(co));
      });
    }
    this.reportForm = this.fb.group({
      company: ['', [Validators.required]],
      year: new Date(),
    });
  }

  onSubmit() {
    const url = '/api/v2/scheduler/reports';
    const iTeam = this.teamService.getTeam();
    const iSite = this.siteService.getSite();
    if (iTeam && iSite && this.reportForm.valid) {
      const year = new Date(this.reportForm.value.year);
      const period = `${year.getFullYear()}|`
        + `${year.getMonth() + 1}|`
        + `${year.getDate()}`;
      const request: ReportRequest = {
        reportType: 'chargenumber',
        period: period,
        teamid: iTeam.id,
        siteid: iSite.id,
        companyid: this.reportForm.value.company
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
                fileName = 'ChargeNumberStatus.xlsx';
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
