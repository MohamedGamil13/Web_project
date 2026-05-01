import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true, index: true },
    roomType: { type: String, enum: ['single', 'double', 'suite', 'family'], required: true },
    capacity: { type: Number, min: 1, max: 8, required: true },
    pricePerNight: { type: Number, min: 0, required: true },
    quantity: { type: Number, min: 1, default: 1 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        ret.hotel = ret.hotel?.toString?.() ?? ret.hotel;
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Room = mongoose.model('Room', roomSchema);
