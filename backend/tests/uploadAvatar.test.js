import { jest } from "@jest/globals";
import { avatarFileFilter } from "../src/middleware/uploadAvatar.js";
import { ApiError } from "../src/utils/ApiError.js";

describe("avatarFileFilter", () => {
  it("accepts allowed image types", () => {
    const cb = jest.fn();
    avatarFileFilter(
      {},
      {
        fieldname: "avatar",
        originalname: "avatar.png",
        mimetype: "image/png",
      },
      cb,
    );

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("rejects unsupported file types with validation error", () => {
    const cb = jest.fn();
    avatarFileFilter(
      {},
      {
        fieldname: "avatar",
        originalname: "malware.exe",
        mimetype: "application/x-msdownload",
      },
      cb,
    );

    expect(cb).toHaveBeenCalledTimes(1);
    const [err] = cb.mock.calls[0];
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(422);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details[0].field).toBe("avatar");
  });
});
