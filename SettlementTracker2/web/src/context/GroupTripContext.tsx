"use client";

import React from "react";
import { TripFormData, Member } from "@/types/trip.types";

export const GroupContext = React.createContext<{
  trip: any;
  loading: boolean;
  refresh: () => Promise<void>;
  updateTrip: (data: any) => Promise<void>;
  deleteTrip: () => Promise<boolean>;
  addMember: (name: string, email: string) => Promise<boolean>;
  removeMember: (id: string, name: string) => Promise<boolean>;
  leaveGroup: () => Promise<boolean>;

  currentUser: any;
  isAdmin: boolean;
  canEdit: boolean;
  isOnlyMember: boolean;

  showEditDialog: boolean;
  setShowEditDialog: (show: boolean) => void;

  showDeleteDialog: boolean;
  setShowDeleteDialog: (show: boolean) => void;

  showLeaveDialog: boolean;
  setShowLeaveDialog: (show: boolean) => void;

  showAddMemberDialog: boolean;
  setShowAddMemberDialog: (show: boolean) => void;

  editForm: TripFormData;
  setEditForm: React.Dispatch<React.SetStateAction<TripFormData>>;

  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;

  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;

  isSaving: boolean;
  setIsSaving: React.Dispatch<React.SetStateAction<boolean>>;

  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;

  fileInputRef: React.RefObject<HTMLInputElement>;

  handleImageSelect: (file: File) => Promise<void>;
  handleImageRemove: () => void;
  handleSaveGroup: () => Promise<void>;
  handleAddMember: () => Promise<void>;
  handleDeleteGroup: () => Promise<void>;
  handleLeaveGroup: () => Promise<void>;
  handleRemoveMember: (member: Member) => Promise<void>;

  memberToRemove: Member | null;
  setMemberToRemove: React.Dispatch<React.SetStateAction<Member | null>>;

  isRemoving: boolean;

  newMemberName: string;
  setNewMemberName: React.Dispatch<React.SetStateAction<string>>;

  newMemberEmail: string;
  setNewMemberEmail: React.Dispatch<React.SetStateAction<string>>;

  isAdding: boolean;

  showCropper: boolean;
  setShowCropper: React.Dispatch<React.SetStateAction<boolean>>;

  tempImagePreview: string | null;
  tempImageFile: File | null;

  handleCropComplete: (croppedFile: File) => Promise<void>;

  isLeaving: boolean;
} | null>(null);