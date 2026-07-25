// constants/index.ts
// app/(dashboard)/dashboard/group/constants/index.ts
export const API_ENDPOINTS = {
  // Trip endpoints
  TRIPS: '/api/trips',
  TRIP: (id: string) => `/api/trips/${id}`,
  TRIP_MEMBERS: (id: string) => `/api/trips/${id}/members`,
  TRIP_MEMBER: (tripId: string, memberId: string) => `/api/trips/${tripId}/members/${memberId}`,
  TRIP_LEAVE: (id: string) => `/api/trips/${id}/leave`,
  TRIP_INVITE: (code: string) => `/api/trips/invite/${code}`,
  TRIP_JOIN: '/api/trips/join',
  
  // Message endpoints
  MESSAGES: (tripId: string) => `/api/trips/${tripId}/messages`,
  MESSAGE: (tripId: string, messageId: string) => `/api/trips/${tripId}/messages/${messageId}`,
  
  // Expense endpoints
  EXPENSES: (tripId: string) => `/api/trips/${tripId}/expenses`,
  EXPENSE: (tripId: string, expenseId: string) => `/api/trips/${tripId}/expenses/${expenseId}`,
  UPLOAD: '/api/upload',
};

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


export const getFullUrl = (path: string) => {
  if (typeof window !== 'undefined') {
    return path; // Browser: use relative URL
  }
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`; // Server: use full URL
};