import * as yup from 'yup';

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export const createReservationSchema = yup.object({
  roomId: yup.string().required('Pick a room'),
  checkIn: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date')
    .test('not-past', 'Check-in cannot be in the past', (v) => !v || v >= todayISO())
    .required('Check-in is required'),
  checkOut: yup
    .string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date')
    .test('after-checkin', 'Check-out must be after check-in', function (v) {
      const { checkIn } = this.parent;
      return !v || !checkIn || v > checkIn;
    })
    .required('Check-out is required'),
  guests: yup
    .number()
    .typeError('Guests is required')
    .integer()
    .min(1, 'At least 1 guest')
    .max(16)
    .required('Guests is required'),
});
