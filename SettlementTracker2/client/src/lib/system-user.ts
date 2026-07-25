// lib/system-user.ts
import prisma from "@/lib/db";

let SYSTEM_USER_ID: string | null = null;

export async function getSystemUser() {
  if (SYSTEM_USER_ID) {
    return SYSTEM_USER_ID;
  }

  const systemUser = await prisma.user.upsert({
    where: { email: "system@deleted.user" },
    update: {},
    create: {
      name: "Deleted User",
      email: "system@deleted.user",
      provider: "system",
    },
  });

  SYSTEM_USER_ID = systemUser.id;
  return SYSTEM_USER_ID;
}