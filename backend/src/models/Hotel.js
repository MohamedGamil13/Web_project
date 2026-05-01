import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '' },
    city: { type: String, required: true, trim: true, index: true },
    country: { type: String, required: true, trim: true },
    address: { type: String, default: '' },
    starRating: { type: Number, min: 1, max: 5, required: true },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    priceFrom: { type: Number, min: 0, default: 0 },
    reviewAvg: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

hotelSchema.index({ name: 'text', city: 'text', description: 'text' });
hotelSchema.index({ priceFrom: 1 });
hotelSchema.index({ reviewAvg: -1 });

export const Hotel = mongoose.model('Hotel', hotelSchema);
