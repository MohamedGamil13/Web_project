import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(80)
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "At least 8 characters")
    .matches(/[A-Za-z]/, "Must contain a letter")
    .matches(/[0-9]/, "Must contain a number")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
  phone: yup.string().trim().max(40).nullable(),
});

export const updateProfileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name is too short")
    .max(80)
    .required("Name is required"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required"),
  phone: yup.string().trim().max(40).nullable(),
  avatarUrl: yup
    .string()
    .trim()
    .test("is-url-or-empty", "Must be a valid URL", (v) => {
      if (!v) return true;
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    })
    .nullable(),
});

export const changePasswordSchema = yup.object({
  newPassword: yup
    .string()
    .min(8, "At least 8 characters")
    .matches(/[A-Za-z]/, "Must contain a letter")
    .matches(/[0-9]/, "Must contain a number")
    .required("New password is required"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your new password"),
});
