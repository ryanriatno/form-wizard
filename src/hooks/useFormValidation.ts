export interface ValidationErrors {
  [key: string]: string | undefined;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function useFormValidation() {
  const validateStep1 = (data: {
    fullName: string;
    email: string;
    department: string;
    role: string;
  }): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!data.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(data.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!data.department.trim()) {
      errors.department = "Department is required";
    }

    if (!data.role) {
      errors.role = "Role is required";
    }

    return errors;
  };

  const validateStep2 = (data: {
    employmentType: string;
    officeLocation: string;
  }): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!data.employmentType) {
      errors.employmentType = "Employment type is required";
    }

    if (!data.officeLocation.trim()) {
      errors.officeLocation = "Office location is required";
    }

    return errors;
  };

  return {
    validateStep1,
    validateStep2,
    validateEmail,
  };
}

