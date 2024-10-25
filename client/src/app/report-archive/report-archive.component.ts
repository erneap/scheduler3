import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReportsService } from '../services/reports.service';
import { IReportTypeList } from '../models/reports/reportType';

@Component({
  selector: 'app-report-archive',
  templateUrl: './report-archive.component.html',
  styleUrl: './report-archive.component.scss'
})
export class ReportArchiveComponent {
  archiveForm: FormGroup;
  reportTypes: string[] = [];

  constructor(
    protected reportsService: ReportsService,
    private fb: FormBuilder
  ) {
    this.archiveForm = this.fb.group({
      rptType: 'schedule',
    });
    this.reportsService.getReportTypes().subscribe({
      next: (data: IReportTypeList) => {

      },
      error: (err: IReportTypeList) => {
        
      }
    })
  }
}
