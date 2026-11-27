export interface PatientAccount {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
}

export interface PatientAccountPage {
  content: PatientAccount[];
  first: number;
  max: number;
  hasNext: boolean;
}
