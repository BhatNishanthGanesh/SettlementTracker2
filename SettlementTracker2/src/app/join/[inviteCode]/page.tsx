// app/join/[token]/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinTripPage({ params }: { params: { inviteCode: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const inviteCode = params.inviteCode;


  console.log("status:", status);
  useEffect(() => {
    console.log("Effect ran");
    const joinTrip = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch(`/api/trips/join/${inviteCode}`, {
            method: 'POST',
          });
          
          const data = await response.json();
          console.log("data",data)
          
          if (!response.ok) {
            throw new Error(data.error || 'Failed to join trip meow');
          }

          toast.success(`Welcome to ${data.data.tripName}!`);
          router.push(`/dashboard/group/${data.data.tripId}`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : 'Failed to join trip bruh');
          // router.push('/dashboard');
        }
      } else if (status === 'unauthenticated') {
        // Redirect to login with callback
        router.push(`/login?callbackUrl=/join/${inviteCode}`);
      }
    };

    joinTrip();
  }, [status, inviteCode, router]);

  // Show loading while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );
}