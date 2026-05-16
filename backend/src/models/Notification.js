import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "reservation_created",
        "reservation_updated",
        "reservation_cancelled",
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    readAt: { type: Date, default: null, index: true },
    payload: {
      reservationId: { type: mongoose.Schema.Types.ObjectId, ref: "Reservation" },
    },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        if (ret.userId?.toString) ret.userId = ret.userId.toString();
        if (ret.payload?.reservationId?.toString) {
          ret.payload.reservationId = ret.payload.reservationId.toString();
        }
        delete ret._id;
        return ret;
      },
    },
  },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
