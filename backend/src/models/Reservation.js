import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
      index: true,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1, max: 16 },
    nights: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'cancelled'], default: 'active', index: true },
    cancelledAt: { type: Date, default: undefined },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        ['userId', 'hotelId', 'roomId'].forEach((k) => {
          if (ret[k] && typeof ret[k] === 'object' && ret[k].toString) {
            ret[k] = ret[k].toString();
          }
        });
        delete ret._id;
        return ret;
      },
    },
  }
);

reservationSchema.index({ roomId: 1, status: 1, checkIn: 1, checkOut: 1 });
reservationSchema.index({ userId: 1, checkIn: -1 });

export const Reservation = mongoose.model('Reservation', reservationSchema);
