import { Variation } from "../employees/assignments";
import { IEmployee } from "../employees/employee";
import { LeaveDay } from "../employees/leave";
import { Work } from "../employees/work";
import { ISite } from "../sites/site";
import { ITeam } from "../teams/team";
import { IUser } from "../users/user";

export interface AuthenticationRequest {
  emailAddress: string;
  password: string;
  add?: boolean;
}

export interface UpdateRequest {
  id: string;
  optional?: string;
  field: string;
  value: string;
}

export interface CreateUserAccount {
  id: string;
  emailAddress: string;
  lastName: string;
  firstName: string;
  middleName: string;
  password: string;
}

export interface ChangePasswordRequest {
  id: string;
  password: string;
}

export interface Message {
  message: string
}

export interface NewEmployeeRequest {
  team: string;
  site: string;
  employee: IEmployee;
  password: string;
}

export interface NewEmployeeAssignment {
  employee: string;
  site: string;
  workcenter: string;
  start: Date;
  scheduledays: number;
}

export interface ChangeAssignmentRequest {
  employee: string;
  asgmt: number;
  schedule?: number;
  workday?: number;
  field: string;
  value: any;
}

export interface NewEmployeeVariation {
  employee: string;
  variation: Variation;
}

export interface LeaveBalanceRequest {
  employee: string;
  year: number;
  annual?: number;
  carryover?: number;
}

export interface EmployeeLeaveRequest {
  employee: string;
  code: string;
  startdate: Date;
  enddate: Date;
}

export interface EmployeeLaborCodeRequest {
  employee: string;
  assignment: number;
  chargeNumber: string;
  extension: string;
}

export interface EmployeeLeaveDayRequest {
  employee: string;
  leave: LeaveDay;
}

export interface AuthenticationResponse {
  user?: IUser;
  token: string;
  exception: string;
}

export interface InitialResponse {
  team?: ITeam;
  site?: ISite;
  employee?: IEmployee;
  exception: string;
}

export interface EmployeeResponse {
  employee?: IEmployee;
  exception: string;
}

export interface Message {
  message: string;
}

export interface EmployeeContactUpdate {
  employee: string;
  typeid: number;
  contactid: number;
  value: string;
}

export interface EmployeeSpecialtyUpdate {
  employee: string;
  typeid: number;
  specialtyid: number;
  value: boolean;
}

export interface EmployeeSpecialtiesUpdate {
  employee: string;
  action: string;
  specialties: number[];
}

export interface EmployeeWorkResponse {
  id?: string;
  year?: number;
  work?: Work[];
  exception: string;
}