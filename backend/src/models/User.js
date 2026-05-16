import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: undefined },
    avatarPath: { type: String, trim: true, default: undefined },
    role: { type: String, enum: ["owner", "user", "admin"], default: "user" },
    permissionOverrides: {
      allow: { type: [String], default: [] },
      deny: { type: [String], default: [] },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: false,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.passwordHash;
        ret.avatarUrl = ret.avatarPath
          ? `/api/v1/users/${ret.id}/avatar`
          : null;
        delete ret.avatarPath;
        return ret;
      },
    },
  },
);

userSchema.index(
  { role: 1 },
  { unique: true, partialFilterExpression: { role: "owner" } },
);

export const User = mongoose.model("User", userSchema);
