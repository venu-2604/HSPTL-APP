export interface NurseType {
  nurse_id: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface NurseAuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  nurse?: NurseType;
} 