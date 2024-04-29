import { ISite, Site } from "../sites/site";
import { Company, ICompany } from "./company";
import { ContactType, IType, SpecialtyType } from "./contacttype";
import { IWorkcode, Workcode } from "./workcode";

export interface ITeam {
  id: string;
  name: string;
  workcodes: IWorkcode[];
  sites: ISite[];
  companies?: ICompany[];
  contacttypes?: IType[];
  specialties?: IType[];
}

export class Team implements ITeam {
  id: string;
  name: string;
  workcodes: Workcode[];
  sites: Site[];
  companies: Company[];
  contacttypes: ContactType[];
  specialties: SpecialtyType[];

  constructor(team?: ITeam) {
    this.id = (team) ? team.id : '';
    this.name = (team) ? team.name : '';
    this.workcodes = [];
    if (team && team.workcodes && team.workcodes.length > 0) {
      team.workcodes.forEach(wc => {
        this.workcodes.push(new Workcode(wc));
      });
      this.workcodes.sort((a,b) => a.compareTo(b));
    }
    this.sites = [];
    if (team && team.sites && team.sites.length > 0) {
      team.sites.forEach(site => {
        this.sites.push(new Site(site));
      });
      this.sites.sort((a,b) => a.compareTo(b));
    }
    this.companies = [];
    if (team && team.companies && team.companies.length > 0) {
      team.companies.forEach(com => {
        this.companies.push(new Company(com));
      });
      this.companies.sort((a,b) => a.compareTo(b));
    }
    this.contacttypes = [];
    if (team && team.contacttypes && team.contacttypes.length > 0) {
      team.contacttypes.forEach(ctype => {
        this.contacttypes.push(new ContactType(ctype));
      });
      this.contacttypes.sort((a,b) => a.compareTo(b));
    }
    this.specialties = [];
    if (team && team.specialties && team.specialties.length > 0) {
      team.specialties.forEach(sp => {
        this.specialties.push(new SpecialtyType(sp));
      });
      this.specialties.sort((a,b) => a.compareTo(b));
    }
  }

  compareTo(other?: Team): number {
    if (other) {
      return (this.name < other.name) ? -1 : 1;
    }
    return -1;
  }
}