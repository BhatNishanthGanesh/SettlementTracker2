// app/join/[inviteCode]/page.tsx

"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { tripJoinService } from "@/services/tripJoin.service";

export default function JoinTripPage({
  params,
}: {
  params: Promise<{
    inviteCode: string;
  }>;
}) {
  const router = useRouter();

  const {
    status,
  } = useSession();

  const { inviteCode } = use(params);

  useEffect(() => {
    const joinTrip = async () => {
      if (status === "authenticated") {
        try {
          const response =
            await tripJoinService.joinTrip(
              inviteCode
            );

          const data = response.data;

          toast.success(
            `Welcome to ${data.data.tripName}!`
          );

          router.push(
            `/dashboard/group/${data.data.tripId}`
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Failed to join trip"
          );
        }
      } else if (
        status === "unauthenticated"
      ) {
        router.push(
          `/login?callbackUrl=/join/${inviteCode}`
        );
      }
    };

    joinTrip();
  }, [
    status,
    inviteCode,
    router,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />

        <p className="text-sm text-gray-500">
          {status === "loading"
            ? "Checking authentication..."
            : "Joining trip..."}
        </p>
      </div>
    </div>
  );
}