import { Component } from '@angular/core';
import { Variation } from 'src/app/models/employees/assignments';
import { Employee } from 'src/app/models/employees/employee';
import { WebEmployeeVariation } from 'src/app/models/web/internalWeb';
import { SiteService } from 'src/app/services/site.service';

@Component({
  selector: 'app-site-mid-schedule',
  templateUrl: './site-mid-schedule.component.html',
  styleUrls: ['./site-mid-schedule.component.scss']
})
export class SiteMidScheduleComponent {
  midList: WebEmployeeVariation[] = [];
  year: number;

  constructor(
    protected siteService: SiteService
  ) { 
    this.year = (new Date()).getFullYear();
    this.setMidsList();
  }

  setMidsList() {
    this.midList = [];
    const start = new Date(Date.UTC(this.year, 0, 1));
    const end = new Date(Date.UTC(this.year + 1, 0, 1))
    const site = this.siteService.getSite();
    if (site && site.employees) {
      site.employees.forEach(iEmp => {
        const emp = new Employee(iEmp);
        emp.variations.forEach(iVar => {
          const vari = new Variation(iVar);
          if (vari.mids && vari.site === site.id 
            && vari.enddate.getTime() >= start.getTime() 
            && vari.startdate.getTime() < end.getTime()
            && (emp.activeOnDate(vari.startdate) 
            || emp.activeOnDate(vari.enddate))) {
            const midvar = new WebEmployeeVariation(emp, vari);
            this.midList.push(midvar);
          }
        });
      });
    }
    this.midList.sort((a,b) => a.compareTo(b));
  }

  dateString(date: Date): string {
    const months: string[] = new Array('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec');
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  }

  updateYear(direction: string) {
    if (direction.substring(0,1).toLowerCase() === 'u') {
      this.year++;
    } else { 
      this.year--;
    }
    this.setMidsList();
  }
}
