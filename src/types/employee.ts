export interface Department {
  id: number;
  name: string;
}

export interface Location {
  id: number;
  name: string;
}

export type Role = "Ops" | "Admin" | "Engineer" | "Finance";

export type EmploymentType = "Full-time" | "Part-time" | "Contract" | "Intern";

export interface BasicInfo {
  id?: number;
  fullName: string;
  email: string;
  department: string;
  role: Role;
  employeeId: string;
}

export interface Details {
  id?: number;
  employeeId: string;
  email: string;
  employmentType: EmploymentType;
  officeLocation: string;
  notes: string;
  photo?: string; // Base64 string
}

export interface Employee extends BasicInfo {
  employmentType?: EmploymentType;
  officeLocation?: string;
  notes?: string;
  photo?: string;
}
