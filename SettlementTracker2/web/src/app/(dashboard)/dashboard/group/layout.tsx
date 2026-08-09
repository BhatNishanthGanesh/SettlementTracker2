import { ReactNode } from 'react';
import { GroupSidebar } from '@/components/dashboard/group/GroupSidebar';
import { GroupProvider } from '@/context/GroupContext';

interface GroupLayoutProps {
  children: ReactNode;
}

export default function GroupLayout({ children }: GroupLayoutProps) {
  return (
    <GroupProvider>
      <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <GroupSidebar />
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 h-full w-full min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </GroupProvider>
  );
}