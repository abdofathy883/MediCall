export enum Gender {
  Male = 0,
  Female = 1
}

export interface Location {
  city: string;
  address: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export enum VerificationDocumentType {
  License = 'License',
  GraduationCertificate = 'GraduationCertificate',
  CriminalRecord = 'CriminalRecord',
  SyndicateCard = 'SyndicateCard'
}

export interface VerificationDocument {
  type: VerificationDocumentType;
  file: File;
}

export interface RefreshToken {
  token: string;
  expires: Date;
  created: Date;
  revoked?: Date;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatReference {
  id: string;
  chatId: string;
}

export interface BaseUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender: Gender;
  profilePicture?: string;
  location: Location;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  token?: string;
  refreshTokens?: RefreshToken[];
  notifications?: Notification[];
  chatReferences?: ChatReference[];
}

export interface Patient extends BaseUser {
  role: 'Patient';
}

export interface Nurse extends BaseUser {
  role: 'Nurse';
  verificationDocuments: string[]; // URLs to the verification documents
  isVerified: boolean;
}

export type User = Patient | Nurse;

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPatientRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: Date;
  gender: Gender;
  profilePicture?: string;
  location: Location;
}

export interface RegisterNurseRequest extends RegisterPatientRequest {
  verificationDocuments: {
    license: File;
    graduationCertificate: File;
    criminalRecord: File;
    syndicateCard: File;
  };
}

export interface AuthResponse {
  user: User;
  token: string;
}
