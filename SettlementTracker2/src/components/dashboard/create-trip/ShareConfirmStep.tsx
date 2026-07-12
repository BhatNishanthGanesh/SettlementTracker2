// components/trips/ShareConfirmStep.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Link as LinkIcon, 
  Copy, 
  Check, 
  Compass,
  PartyPopper,
  Loader2
} from 'lucide-react';
import { TripFormData, Member } from '@/app/(dashboard)/dashboard/create-trip/types/trip';

interface ShareConfirmStepProps {
  formData: TripFormData;
  members: Member[];
  imagePreview: string | null;
  shareableLink: string;
  isLinkGenerated: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  getTotalMembers: () => number;
  onGenerateLink: () => void;
  onCopyLink: () => void;
  isCopied: boolean;
}

export const ShareConfirmStep: React.FC<ShareConfirmStepProps> = ({
  formData,
  members,
  imagePreview,
  shareableLink,
  isLinkGenerated,
  isSubmitting,
  isUploading,
  getTotalMembers,
  onGenerateLink,
  onCopyLink,
  isCopied,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Share & Confirm
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Invite your friends and finalize your trip
        </p>
      </div>

      <div className="space-y-4">
        <ShareableLinkSection
          isLinkGenerated={isLinkGenerated}
          shareableLink={shareableLink}
          isCopied={isCopied}
          onGenerateLink={onGenerateLink}
          onCopyLink={onCopyLink}
        />

        <EmailInvitationInfo />

        <hr className="border-gray-200 dark:border-gray-800" />

        <TripSummary
          formData={formData}
          imagePreview={imagePreview}
          totalMembers={getTotalMembers()}
        />
      </div>
    </div>
  );
};

const ShareableLinkSection: React.FC<{
  isLinkGenerated: boolean;
  shareableLink: string;
  isCopied: boolean;
  onGenerateLink: () => void;
  onCopyLink: () => void;
}> = ({ isLinkGenerated, shareableLink, isCopied, onGenerateLink, onCopyLink }) => (
  <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          Invite Members
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isLinkGenerated ? 'Share this link with your friends' : 'Generate a shareable link'}
        </p>
      </div>
      <Button
        type="button"
        variant={isLinkGenerated ? "outline" : "default"}
        onClick={onGenerateLink}
        size="sm"
        className={cn(
          "transition-all",
          isLinkGenerated && "border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400"
        )}
      >
        {isLinkGenerated ? (
          <>
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Link Ready
          </>
        ) : (
          <>
            <LinkIcon className="h-3.5 w-3.5 mr-1.5" />
            Generate Link
          </>
        )}
      </Button>
    </div>
    {isLinkGenerated && (
      <div className="flex items-center gap-2 mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Input
          value={shareableLink}
          readOnly
          className="border-0 h-8 text-sm bg-transparent focus-visible:ring-0 p-0 text-gray-600 dark:text-gray-300"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onCopyLink}
          className={cn(
            "h-8 w-8 transition-all",
            isCopied ? "text-emerald-500" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          )}
        >
          {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    )}
  </div>
);

const EmailInvitationInfo: React.FC = () => (
  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
      <span className="font-semibold">📧 Email Invitations:</span> Members with email addresses will automatically receive an invitation email with a link to join this trip.
    </p>
  </div>
);

const TripSummary: React.FC<{
  formData: TripFormData;
  imagePreview: string | null;
  totalMembers: number;
}> = ({ formData, imagePreview, totalMembers }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
      <Compass className="h-4 w-4 text-purple-500" />
      Trip Summary
    </h4>
    <div className="grid grid-cols-2 gap-3">
      {imagePreview && (
        <div className="col-span-2">
          <img 
            src={imagePreview} 
            alt="Trip cover" 
            className="w-full h-32 object-cover rounded-lg"
          />
        </div>
      )}
      <SummaryItem label="Trip" value={formData.name || 'Not set'} />
      <SummaryItem label="Budget" value={`₹${formData.budget || '0'}`} />
      <SummaryItem label="Members" value={totalMembers.toString()} />
      <SummaryItem 
        label="Duration" 
        value={
          formData.startDate && formData.endDate
            ? `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`
            : formData.startDate
            ? `${new Date(formData.startDate).toLocaleDateString()} - Ongoing`
            : 'Not set'
        }
      />
    </div>
  </div>
);

const SummaryItem: React.FC<{
  label: string;
  value: string;
}> = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
    <span className="text-xs text-muted-foreground">{label}</span>
    <p className="font-medium text-gray-900 dark:text-white mt-0.5 text-sm truncate">
      {value}
    </p>
  </div>
);
