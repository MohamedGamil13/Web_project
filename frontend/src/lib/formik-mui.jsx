import { useField, useFormikContext } from 'formik';
import { TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// Drop-in MUI TextField wired to Formik. Use anywhere you'd otherwise call
// useField + spread the field props onto a <TextField>.
export function FTextField({ name, helperText, ...props }) {
  const [field, meta] = useField(name);
  const showError = meta.touched && Boolean(meta.error);
  return (
    <TextField
      {...field}
      {...props}
      value={field.value ?? ''}
      error={showError}
      helperText={showError ? meta.error : helperText}
      fullWidth
      variant="outlined"
      size="small"
    />
  );
}

// Formik-bound MUI X DatePicker. Stores ISO `YYYY-MM-DD` strings in the form
// state so existing Yup schemas keep working unchanged. The optional `onChange`
// callback fires AFTER the field value is set — handy for cross-field updates
// (e.g. bumping a checkout date when check-in moves past it).
export function FDatePicker({ name, label, minDate, maxDate, helperText, onChange }) {
  const [field, meta] = useField(name);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const showError = meta.touched && Boolean(meta.error);
  return (
    <DatePicker
      label={label}
      value={field.value ? dayjs(field.value) : null}
      onChange={(d) => {
        setFieldValue(name, d ? d.format('YYYY-MM-DD') : '', true);
        if (onChange) onChange(d);
      }}
      minDate={minDate}
      maxDate={maxDate}
      slotProps={{
        textField: {
          name,
          size: 'small',
          fullWidth: true,
          onBlur: () => setFieldTouched(name, true),
          error: showError,
          helperText: showError ? meta.error : helperText,
        },
      }}
    />
  );
}
