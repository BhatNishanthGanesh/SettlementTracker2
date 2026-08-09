// components/trips/TripDetailsStep.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  CalendarDays,
  MapPin,
  Edit3,
  Upload,
  X
} from 'lucide-react';
import { TripFormData, DateErrors } from '@/types/trip.types';
import { ImageCropper } from "@/components/dashboard/ImageCropper";

interface TripDetailsStepProps {
  formData: TripFormData;
  dateErrors: DateErrors;
  imagePreview: string | null;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  cropperOpen: boolean;
  cropImage: string;
  onCropComplete: (file: File) => void;
  closeCropper: () => void;
}

export const TripDetailsStep: React.FC<TripDetailsStepProps> = ({
  formData,
  dateErrors,
  imagePreview,
  isUploading,
  fileInputRef,
  onInputChange,
  onImageUpload,
  onRemoveImage,
  cropperOpen,
  cropImage,
  onCropComplete,
  closeCropper,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Trip Details
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about your upcoming adventure
        </p>
      </div>

      <div className="space-y-4">
        <ImageUploadSection
          imagePreview={imagePreview}
          isUploading={isUploading}
          fileInputRef={fileInputRef}
          onImageUpload={onImageUpload}
          onRemoveImage={onRemoveImage}
        />

        <TripNameInput
          value={formData.name}
          onChange={onInputChange}
        />

        <DestinationInput
          value={formData.destination}
          onChange={onInputChange}
        />

        <DateInputs
          startDate={formData.startDate}
          endDate={formData.endDate}
          dateErrors={dateErrors}
          onInputChange={onInputChange}
        />

        <DescriptionInput
          value={formData.description}
          onChange={onInputChange}
        />
        <ImageCropper
          open={cropperOpen}
          onClose={closeCropper}
          imageSrc={cropImage}
          onCropComplete={onCropComplete}
        />
      </div>
    </div>
  );
};

// Sub-components
const ImageUploadSection: React.FC<{
  imagePreview: string | null;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}> = ({ imagePreview, isUploading, fileInputRef, onImageUpload, onRemoveImage }) => (
  <div>
    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Trip Cover Image <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
    </Label>
    <div className="mt-1.5">
      {!imagePreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onImageUpload}
            className="hidden"
            disabled={isUploading}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-full">
              <Upload className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isUploading ? 'Uploading...' : 'Click to upload'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPEG, PNG, WebP (max 5MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden">
          <img
            src={imagePreview}
            alt="Trip cover"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onRemoveImage}
            className="absolute top-2 right-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  </div>
);

const TripNameInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Trip Name <span className="text-red-500">*</span>
    </Label>
    <div className="relative mt-1.5">
      <div className="absolute left-3 top-2.5">
        <Edit3 className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        id="name"
        name="name"
        placeholder="e.g., Goa Beach Trip"
        value={value}
        onChange={onChange}
        className="pl-9 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      />
    </div>
  </div>
);

const DestinationInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="destination" className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Destination <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
    </Label>
    <div className="relative mt-1.5">
      <div className="absolute left-3 top-2.5">
        <MapPin className="h-4 w-4 text-gray-400" />
      </div>
      <Input
        id="destination"
        name="destination"
        placeholder="e.g., Goa, India"
        value={value}
        onChange={onChange}
        className="pl-9 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      />
    </div>
  </div>
);

const DateInputs: React.FC<{
  startDate: string;
  endDate: string;
  dateErrors: DateErrors;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ startDate, endDate, dateErrors, onInputChange }) => (
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Start Date <span className="text-red-500">*</span>
      </Label>
      <div className="relative mt-1.5">
        <div className="absolute left-3 top-2.5">
          <Calendar className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={startDate}
          onChange={onInputChange}
          className={cn(
            "pl-9 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
            dateErrors.startDate && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>
      {dateErrors.startDate && (
        <p className="text-xs text-red-500 mt-1.5">{dateErrors.startDate}</p>
      )}
    </div>
    <div>
      <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
        End Date <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
      </Label>
      <div className="relative mt-1.5">
        <div className="absolute left-3 top-2.5">
          <CalendarDays className="h-4 w-4 text-gray-400" />
        </div>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          value={endDate}
          onChange={onInputChange}
          min={startDate || undefined}
          className={cn(
            "pl-9 h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700",
            dateErrors.endDate && "border-red-500 focus-visible:ring-red-500"
          )}
        />
      </div>
      {dateErrors.endDate && (
        <p className="text-xs text-red-500 mt-1.5">
          {dateErrors.endDate}
        </p>
      )}
    </div>
  </div>
);

const DescriptionInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ value, onChange }) => (
  <div>
    <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
      Description <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
    </Label>
    <Textarea
      id="description"
      name="description"
      placeholder="Share some details about your trip..."
      value={value}
      onChange={onChange}
      rows={3}
      className="mt-1.5 resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
    />
  </div>
);