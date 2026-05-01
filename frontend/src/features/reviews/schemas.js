import * as yup from "yup";

export const reviewFormSchema = yup.object({
  rating: yup
    .number()
    .typeError("Rating is required")
    .integer("Rating must be a whole number")
    .min(1, "Pick at least 1 star")
    .max(5)
    .required("Rating is required"),
  comment: yup
    .string()
    .trim()
    .max(1000, "Comment is too long (1000 max)")
    .default(""),
});
