import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

export async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  return user.toJSON();
}

export async function updateMe(userId, patch) {
  if (patch.email) {
    const clash = await User.findOne({ email: patch.email, _id: { $ne: userId } }).lean();
    if (clash) throw ApiError.conflict('Email is already in use');
  }

  const cleaned = { ...patch };
  for (const k of ['phone', 'avatarUrl']) {
    if (cleaned[k] === '' || cleaned[k] === null) {
      cleaned[k] = undefined;
    }
  }

  const user = await User.findByIdAndUpdate(userId, cleaned, {
    new: true,
    runValidators: true,
    context: 'query',
  });
  if (!user) throw ApiError.notFound('User not found');
  return user.toJSON();
}
