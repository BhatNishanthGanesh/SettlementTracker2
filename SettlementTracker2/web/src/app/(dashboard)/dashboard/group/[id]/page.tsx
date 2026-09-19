"use client";

import React, { useContext } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  MessageCircle,
  Receipt,
  HandCoins,
} from "lucide-react";
import { toast } from "sonner";
import { Member } from "@/types/trip.types";

import { useMessages } from "@/hooks/useMessages";
import { GroupHeader } from "@/components/dashboard/group/GroupHeader";
import { ChatTab } from "@/components/dashboard/group/ChatTab";
import { ExpensesTab } from "@/components/dashboard/group/ExpensesTab";
import { SettleTab } from "@/components/dashboard/group/SettleTab";

import { GroupContext } from "@/context/GroupTripContext";

const tabConfigs = {
  chat: { icon: MessageCircle, label: "Chat" },
  expenses: { icon: Receipt, label: "Expenses" },
  settle: { icon: HandCoins, label: "Settle Up" },
};

export default function GroupPage() {
  const params = useParams();
  const { data: session } = useSession();
  const groupId = params?.id as string;
  

  const context = useContext(GroupContext);

  if (!context) {
    throw new Error(
      "GroupPage must be used within GroupLayout"
    );
  }

  const {
    trip,
    loading,
    refresh,
    currentUser,
    isAdmin,
    isOnlyMember,
    setShowEditDialog,
    setShowAddMemberDialog,
    setShowDeleteDialog,
    setShowLeaveDialog,
  } = context;

  const totalTripSpent = (trip?.expenses ?? []).reduce(
    (sum:any, expense:any) => sum + Number(expense.amount),
    0
  );

  const {
    messages,
    isSending,
    isLoading,
    isConnected,
    typingUsers,
    sendMessage,
    sendTyping,
    editMessage,
    deleteMessage,
  } = useMessages(groupId, trip?.name);



const handleSendMessage = (
  text: string,
  attachments?: any[]
) => {
  sendMessage(text, attachments);
};

  const handleTyping = (isTyping: boolean) => {
    const username = session?.user?.name;
    if(!username) return;
    sendTyping(
      isTyping,
      username
    );
  };

  const handleExpenseAdded = async () => {
    await refresh();

    toast.success(
      "Expense added successfully! 💰",
      {
        description:
          "Check the chat for details.",
        duration: 3000,
      }
    );
  };

  const handleExpenseDeleted = async () => {
    await refresh();
    toast.success("Expenses updated");
  };

  if (loading || !trip) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading group...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <GroupHeader
        trip={trip}
        isAdmin={isAdmin}
        isOnlyMember={isOnlyMember}
        onEdit={() => setShowEditDialog(true)}
        onAddMember={() =>
          setShowAddMemberDialog(true)
        }
        onDelete={() =>
          setShowDeleteDialog(true)
        }
        onLeave={() =>
          setShowLeaveDialog(true)
        }
      />

      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs
          defaultValue="chat"
          className="h-full flex flex-col"
        >
          <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/70 dark:border-gray-700/70">
            <div className="max-w-6xl mx-auto px-4">
              <TabsList className="h-14 w-full bg-transparent p-0 gap-1">
                {Object.entries(tabConfigs).map(
                  ([value, config]) => {
                    const Icon = config.icon;

                    return (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="
                          relative h-14 px-6 flex-1 sm:flex-none
                          gap-2.5
                          data-[state=active]:bg-transparent
                          data-[state=active]:shadow-none
                          data-[state=active]:text-blue-600
                          dark:data-[state=active]:text-blue-400
                          text-gray-500 dark:text-gray-400
                          hover:text-gray-700 dark:hover:text-gray-200
                          transition-all duration-200
                          rounded-none font-medium text-sm
                          border-b-2 border-transparent
                          data-[state=active]:border-blue-500
                          hover:border-gray-300
                          dark:hover:border-gray-600
                          group
                        "
                      >
                        <Icon
                          className="
                            h-4 w-4 transition-transform
                            duration-200 group-hover:scale-110
                          "
                        />

                        <span className="hidden sm:inline">
                          {config.label}
                        </span>

                        <span
                          className="
                            sm:hidden absolute bottom-1
                            left-1/2 -translate-x-1/2
                            w-1 h-1 rounded-full bg-blue-500
                            opacity-0
                            data-[state=active]:opacity-100
                          "
                        />
                      </TabsTrigger>
                    );
                  }
                )}
              </TabsList>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            <TabsContent
              value="chat"
              className="absolute inset-0 m-0 h-full overflow-hidden"
            >
              <ChatTab
                messages={messages}
                isSending={isSending}
                isLoading={isLoading}
                isConnected={isConnected}
                typingUsers={typingUsers}
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                onEditMessage={editMessage}
                onDeleteMessage={deleteMessage}
              />
            </TabsContent>

            <TabsContent
              value="expenses"
              className="absolute inset-0 m-0 h-full overflow-y-auto"
            >
              <ExpensesTab
                trip={trip}
                totalSpent={totalTripSpent}
                onExpenseAdded={handleExpenseAdded}
                onExpenseDeleted={handleExpenseDeleted}
                currentUser={currentUser}
                isAdmin={isAdmin}
              />
            </TabsContent>

            <TabsContent
              value="settle"
              className="absolute inset-0 m-0 h-full overflow-y-auto"
            >
              <SettleTab
                trip={trip}
                currentUser={currentUser}
                onSettleUp={memberId => {
                  const member = trip.members.find(
                    (member: Member) => member.id === memberId
                  );

                  toast.info(
                    `Settle up with ${member?.name
                    } - Feature coming soon!`
                  );
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}