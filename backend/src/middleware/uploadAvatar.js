import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const AVATAR_DIR = path.resolve(process.cwd(), "storage/avatars");
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = MIME_TO_EXT[file.mimetype] ?? "bin";
    const id = req.user?.id ?? "anon";
    cb(
      null,
      `${id}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`,
    );
  },
});

export function avatarFileFilter(_req, file, cb) {
  if (!MIME_TO_EXT[file.mimetype]) {
    cb(
      ApiError.validation("Invalid request", [
        { field: "avatar", message: "Only jpg/png/webp/gif are allowed" },
      ]),
    );
    return;
  }
  cb(null, true);
}

const uploader = multer({
  storage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAvatar = uploader.single("avatar");
export { AVATAR_DIR };
