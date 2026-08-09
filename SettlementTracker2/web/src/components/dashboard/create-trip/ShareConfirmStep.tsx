import { Compass, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { Member, TripFormData } from "@/types/trip.types";

interface ShareConfirmStepProps {
  formData: TripFormData;
  imagePreview: string | null;
  members: Member[];
  totalMembers: number;
}

export function ShareConfirmStep({
  formData,
  imagePreview,
  members,
  totalMembers,
}: ShareConfirmStepProps) {
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
        <EmailInvitationInfo />

        <hr className="border-gray-200 dark:border-gray-800" />

        <TripSummary
          formData={formData}
          imagePreview={imagePreview}
          totalMembers={totalMembers}
        />

        <InvitedMembers members={members} />
      </div>
    </div>
  );
}

function EmailInvitationInfo() {
  return (
    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
        <span className="font-semibold">📧 Email Invitations:</span>{" "}
        Members will automatically receive an invitation email with a link to
        join this trip.
      </p>
    </div>
  );
}

interface TripSummaryProps {
  formData: TripFormData;
  imagePreview: string | null;
  totalMembers: number;
}

function TripSummary({
  formData,
  imagePreview,
  totalMembers,
}: TripSummaryProps) {
  return (
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

        <SummaryItem
          label="Trip"
          value={formData.name || "Not set"}
        />

        <SummaryItem
          label="Budget"
          value={formatCurrency(Number(formData.budget))}
        />

        <SummaryItem
          label="Members"
          value={totalMembers.toString()}
        />

        <SummaryItem
          label="Duration"
          value={
            formData.startDate && formData.endDate
              ? `${formatDate(formData.startDate)} - ${formatDate(
                  formData.endDate
                )}`
              : formData.startDate
              ? `${formatDate(formData.startDate)} - Ongoing`
              : "Not set"
          }
        />
      </div>
    </div>
  );
}

interface SummaryItemProps {
  label: string;
  value: string;
}

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
      <span className="text-xs text-muted-foreground">
        {label}
      </span>

      <p className="font-medium text-gray-900 dark:text-white mt-0.5 text-sm truncate">
        {value}
      </p>
    </div>
  );
}

interface InvitedMembersProps {
  members: Member[];
}

function InvitedMembers({
  members,
}: InvitedMembersProps) {
  const validMembers = members.filter(
    (member) => member.name.trim() || member.email.trim()
  );

  if (validMembers.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Invited Members ({validMembers.length})
      </h4>

      <div className="space-y-2">
        {validMembers.map((member) => (
          <div
            key={`${member.name}-${member.email}`}
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
              <User className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
            </div>

            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {member.name}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {member.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}