import { isValidPhoneNumber, type Country } from "react-phone-number-input";

export function validateFullName(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Full name is required.";
  }

  if (trimmed.length < 2) {
    return "Full name must be at least 2 characters.";
  }

  return null;
}

export function validateEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return "Enter a valid email address.";
  }

  return null;
}

export function normalizePhoneNumber(
  countryCode: Country | string,
  value: string,
) {
  if (!value) {
    return {
      isValid: false as const,
      error: "Phone number is required.",
    };
  }

  const isValid = isValidPhoneNumber(value, countryCode as Country);
  if (!isValid) {
    return {
      isValid: false as const,
      error: "Enter a valid phone number for the selected country.",
    };
  }

  return {
    isValid: true as const,
    normalizedPhone: value,
  };
}

export function validateSignupValues(values: {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  password: string;
  confirmPassword: string;
}) {
  const fullNameError = validateFullName(values.name);
  if (fullNameError) {
    return { isValid: false as const, error: fullNameError };
  }

  const emailError = validateEmail(values.email);
  if (emailError) {
    return { isValid: false as const, error: emailError };
  }

  const phoneResult = normalizePhoneNumber(values.countryCode, values.phone);
  if (!phoneResult.isValid) {
    return { isValid: false as const, error: phoneResult.error };
  }

  if (!values.password) {
    return { isValid: false as const, error: "Password is required." };
  }

  if (values.password.length < 8) {
    return {
      isValid: false as const,
      error: "Password must be at least 8 characters.",
    };
  }

  if (values.password !== values.confirmPassword) {
    return { isValid: false as const, error: "Passwords do not match." };
  }

  return {
    isValid: true as const,
    normalizedPhone: phoneResult.normalizedPhone,
  };
}
