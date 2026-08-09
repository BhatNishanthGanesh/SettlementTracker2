export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ] as readonly string[],
};

export const STATUS_CONFIG = {
  ONLINE: 'bg-green-500',
  AWAY: 'bg-yellow-500',
  OFFLINE: 'bg-gray-400',
} as const;