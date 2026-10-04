export type Role = "admin" | "student" | "company";

export interface Profile {
  id: string;
  auth_user_id: string | null;
  email: string;
  role: Role;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface Student {
  id: number;
  profile_id: string;
  roll_number: string;
  branch: string;
  semester: number;
  cgpa: number;
  skills: string | null;
  resume_summary: string | null;
  placed: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Company {
  id: number;
  profile_id: string;
  company_name: string;
  industry: string | null;
  website: string | null;
  description: string | null;
  location: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Internship {
  id: number;
  company_id: number;
  title: string;
  description: string | null;
  location: string | null;
  duration: string | null;
  stipend: number | null;
  required_skills: string | null;
  deadline: string | null;
  status: "open" | "closed";
  created_at: string;
  company?: Company;
}

export interface Job {
  id: number;
  company_id: number;
  title: string;
  description: string | null;
  location: string | null;
  salary: number | null;
  required_skills: string | null;
  job_type: string | null;
  deadline: string | null;
  status: "open" | "closed";
  created_at: string;
  company?: Company;
}

export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Interview Scheduled"
  | "Selected"
  | "Rejected";

export interface Application {
  id: number;
  student_id: number;
  internship_id: number | null;
  job_id: number | null;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
  student?: Student;
  internship?: Internship;
  job?: Job;
}

export interface Interview {
  id: number;
  application_id: number;
  interview_date: string;
  interview_time: string;
  mode: "Online" | "Offline";
  location_link: string | null;
  rounds: string | null;
  result: "Pending" | "Selected" | "Rejected";
  notes: string | null;
  created_at: string;
  application?: Application;
}

export interface Placement {
  id: number;
  student_id: number;
  company_id: number;
  job_id: number | null;
  package: number | null;
  joining_date: string | null;
  status: "Placed" | "Offered" | "Joined";
  created_at: string;
  student?: Student;
  company?: Company;
  job?: Job;
}
