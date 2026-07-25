// hooks/useTripForm.ts
import { useState } from 'react';
import { TripFormData, Member, DateErrors } from '@/app/(dashboard)/dashboard/create-trip/types/trip';

export const useTripForm = () => {
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    description: ''
  });
  const [members, setMembers] = useState<Member[]>([{ name: '', email: '' }]);
  const [dateErrors, setDateErrors] = useState<DateErrors>({
    startDate: '',
    endDate: ''
  });

  const validateDate = (value: string, field: 'startDate' | 'endDate'): boolean => {
    if (!value) {
      setDateErrors(prev => ({ ...prev, [field]: '' }));
      return true;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      setDateErrors(prev => ({ ...prev, [field]: 'Invalid date format. Use DD-MM-YYYY' }));
      return false;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      setDateErrors(prev => ({ ...prev, [field]: 'Invalid date' }));
      return false;
    }

    if (year.toString().length !== 4) {
      setDateErrors(prev => ({ ...prev, [field]: 'Year must be 4 digits' }));
      return false;
    }

    const currentYear = new Date().getFullYear();
    if (year < currentYear - 100 || year > currentYear + 100) {
      setDateErrors(prev => ({ ...prev, [field]: `Year should be between ${currentYear - 100} and ${currentYear + 100}` }));
      return false;
    }

    setDateErrors(prev => ({ ...prev, [field]: '' }));
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'startDate' || name === 'endDate') {
      validateDate(value, name as 'startDate' | 'endDate');
    }
  };

  const handleMemberChange = (index: number, field: 'name' | 'email', value: string) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const addMember = () => {
    setMembers([...members, { name: '', email: '' }]);
  };

  const removeMember = (index: number) => {
    if (members.length <= 1) return;
    setMembers(members.filter((_, i) => i !== index));
  };

  const getTotalMembers = () => {
    return 1 + members.filter(m => m.name.trim() || m.email.trim()).length;
  };

  const isDateValid = (value: string): boolean => {
    if (!value) return true;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const isEndDateValid = (): boolean => {
    if (!formData.startDate) return true;
    if (!formData.endDate) return true;
    
    if (!isDateValid(formData.startDate) || !isDateValid(formData.endDate)) {
      return false;
    }
    
    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return false;
      }
      
      return end >= start;
    } catch (error) {
      return false;
    }
  };

  return {
    formData,
    setFormData,
    members,
    setMembers,
    dateErrors,
    setDateErrors,
    handleInputChange,
    handleMemberChange,
    addMember,
    removeMember,
    getTotalMembers,
    isDateValid,
    isEndDateValid,
    validateDate
  };
};