import { Avatar } from "@mui/material";
import { toAuthenticatedAssetUrl } from "@/lib/apiClient";

const PALETTE = [
  "#5B6CFF", // indigo
  "#1E88E5", // blue
  "#00897B", // teal
  "#43A047", // green
  "#FB8C00", // orange
  "#E53935", // red
  "#8E24AA", // purple
  "#6D4C41", // brown
  "#546E7A", // blue-grey
];

function colorFromName(name) {
  if (!name) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsFromName(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return (
    parts
      .map((p) => p[0])
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?"
  );
}

// Shared circular avatar. If user.avatarUrl is set, shows the image; otherwise
// renders the user's initials over a colored disk derived deterministically
// from the name.
export function UserAvatar({ user, size = 36, sx, ...props }) {
  const name = user?.name ?? "";
  const src = toAuthenticatedAssetUrl(user?.avatarUrl) || undefined;
  return (
    <Avatar
      src={src}
      alt={name}
      sx={{
        width: size,
        height: size,
        bgcolor: src ? undefined : colorFromName(name),
        color: "common.white",
        fontSize: Math.round(size * 0.4),
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    >
      {initialsFromName(name)}
    </Avatar>
  );
}
