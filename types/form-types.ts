// Define the expected type for the useAuth hook's return value
export interface AuthContextType {
  user: any; // Replace `any` with your actual user type
  login: (userData: any) => void; // Adjust according to the actual parameters and types
  logout: () => void;
}

export interface LoginFormFields {
  phoneNumber: string;
  password: string;
}


// Define the types for the form data
export type SignUpFormData = {
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export type OTPFormData = {
  otp: string;
};


