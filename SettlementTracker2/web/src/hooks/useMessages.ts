// hooks/useMessages.ts

import { useState, useCallback, useEffect } from "react";
import { messageService } from "@/services/message.service";
import { Message, Attachment } from "@/types/trip.types";
import { toast } from "sonner";
import { socketService } from "@/services/socket.service";
import { useSession } from "next-auth/react";

export function useMessages(tripId: string, tripName?: string) {
  const { data: session } = useSession();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [notificationPreferences, setNotificationPreferences] = useState({
    budgetNotifications: true,
    paymentNotifications: true,
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((response) => response.json())
      .then((data) => {
        const profile = data.data;
        if (profile) {
          setNotificationPreferences({
            budgetNotifications: profile.budgetNotifications ?? true,
            paymentNotifications: profile.paymentNotifications ?? true,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  // =========================================================
  // Map API / Socket message -> frontend Message
  // =========================================================

  const mapApiMessageToMessage = useCallback(
    (msg: any): Message => ({
      id: msg.id,

      sender: msg.sender,

      senderId: msg.senderId,

      senderImage:
        msg.senderImage || null,

      text: msg.text,

      timestamp: msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString()
        : new Date().toLocaleTimeString(),

      isOwn:
        msg.senderId === session?.user?.id ||
        msg.sender === session?.user?.name,

      type: msg.type || "text",

      createdAt: msg.createdAt,

      updatedAt: msg.updatedAt,

      edited: msg.edited || false,

      editedAt: msg.editedAt,

      deleted: msg.deleted || false,

      metadata: msg.metadata || null,

      attachments:
        msg.metadata?.attachments ||
        msg.attachments ||
        undefined,
    }),
    [session]
  );

  // =========================================================
  // Load existing messages
  // =========================================================

  useEffect(() => {
    if (!tripId) return;

    const loadMessages = async () => {
      try {
        setIsLoading(true);

        const response =
          await messageService.getMessages(tripId);

        const fetchedMessages =
          response.data?.data || [];

        if (fetchedMessages.length > 0) {
          const mappedMessages =
            fetchedMessages.map(
              mapApiMessageToMessage
            );

          setMessages(mappedMessages);
        } else {
          setMessages([
            {
              id: "welcome",
              sender: "System",
              text: `Welcome to "${tripName || "the group"
                }"! Start planning your trip! 🎉`,
              timestamp:
                new Date().toLocaleTimeString(),
              isOwn: false,
              type: "text",
              senderImage: null,
              createdAt:
                new Date().toISOString(),
              updatedAt:
                new Date().toISOString(),
              edited: false,
              deleted: false,
              metadata: null,
            },
          ]);
        }
      } catch (error) {
        console.error(
          "❌ Error loading messages:",
          error
        );

        setMessages([
          {
            id: "welcome",
            sender: "System",
            text: `Welcome to "${tripName || "the group"
              }"! Start planning your trip! 🎉`,
            timestamp:
              new Date().toLocaleTimeString(),
            isOwn: false,
            type: "text",
            senderImage: null,
            createdAt:
              new Date().toISOString(),
            updatedAt:
              new Date().toISOString(),
            edited: false,
            deleted: false,
            metadata: null,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [
    tripId,
    tripName,
    mapApiMessageToMessage,
  ]);

  // =========================================================
  // Setup Socket.IO
  // =========================================================

  useEffect(() => {
    if (!tripId) return;

    socketService.connect(tripId);

    setIsConnected(
      socketService.isConnected()
    );

    // -------------------------------------------------------
    // New message
    // -------------------------------------------------------

    const messageHandler = (
      newMessage: any
    ) => {
      setMessages(
        (prev: Message[]) => {
          // Prevent duplicates
          const exists = prev.some(
            (msg) =>
              msg.id === newMessage.id
          );

          if (exists) {
            return prev;
          }

          const message =
            mapApiMessageToMessage(
              newMessage
            );

          return [
            ...prev,
            message,
          ];
        }
      );

      const shouldNotify =
        (newMessage.type === "budget_alert" && notificationPreferences.budgetNotifications) ||
        ((newMessage.type === "payment" || newMessage.type === "settlement_request") &&
          notificationPreferences.paymentNotifications);

      if (shouldNotify && newMessage.text) {
        toast.info(newMessage.text, { duration: 3500 });
      }
    };

    // -------------------------------------------------------
    // Edit message
    // -------------------------------------------------------

    const editHandler = (editedMessage: any) => {


      setMessages((prev: Message[]) =>
        prev.map((msg: Message) =>
          msg.id === editedMessage.id
            ? {
              ...msg,
              ...mapApiMessageToMessage(editedMessage),
            }
            : msg
        )
      );
    };

    // -------------------------------------------------------
    // Delete message
    // -------------------------------------------------------

    const deleteHandler = (data: {
      messageId: string;
    }) => {

      setMessages(
        (prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === data.messageId
              ? {
                ...msg,
                text:
                  "This message was deleted",
                deleted: true,
              }
              : msg
          )
      );
    };

    // -------------------------------------------------------
    // Typing
    // -------------------------------------------------------

    const typingHandler = (data: {
      user: string;
      isTyping: boolean;
    }) => {
      setTypingUsers(
        (prev: Set<string>) => {
          const newSet = new Set(
            prev
          );

          if (data.isTyping) {
            newSet.add(data.user);
          } else {
            newSet.delete(data.user);
          }

          return newSet;
        }
      );
    };

    // -------------------------------------------------------
    // Connection status
    // -------------------------------------------------------

    const connectionHandler = (
      status: {
        connected: boolean;
        error?: string;
      }
    ) => {

      setIsConnected(
        status.connected
      );

      if (status.error) {
        toast.warning(
          "Chat connection lost. Reconnecting..."
        );
      }
    };

    // Register listeners

    socketService.on(
      "message",
      messageHandler
    );

    socketService.on(
      "edit-message",
      editHandler
    );

    socketService.on(
      "delete-message",
      deleteHandler
    );

    socketService.on(
      "typing",
      typingHandler
    );

    socketService.on(
      "connection-status",
      connectionHandler
    );

    // Cleanup

    return () => {
      socketService.off(
        "message",
        messageHandler
      );

      socketService.off(
        "edit-message",
        editHandler
      );

      socketService.off(
        "delete-message",
        deleteHandler
      );

      socketService.off(
        "typing",
        typingHandler
      );

      socketService.off(
        "connection-status",
        connectionHandler
      );

      socketService.disconnect();
    };
  }, [
    tripId,
    mapApiMessageToMessage,
    notificationPreferences,
  ]);

  // =========================================================
  // Send message
  // =========================================================

  const sendMessage = useCallback(
    async (
      text: string,
      attachments?: Attachment[]
    ) => {
      if (
        !text.trim() &&
        (!attachments ||
          attachments.length === 0)
      ) {
        return;
      }

      setIsSending(true);

      try {
        const payload = {
          text: text.trim() || "📎 Image",
          attachments: attachments || [],
        };

        const response =
          await messageService.sendMessage(
            tripId,
            payload
          );

        const sentMessage = response.data?.data;


        if (sentMessage) {
          const message = mapApiMessageToMessage(sentMessage);

          setMessages((prev) => {

            if (prev.some((msg) => msg.id === message.id)) {
              return prev;
            }

            return [...prev, message];
          });
        }

        return sentMessage;
      } catch (error) {
        console.error(
          "❌ Error sending message:",
          error
        );

        toast.error(
          "Failed to send message"
        );

        throw error;
      } finally {
        setIsSending(false);
      }
    },
    [tripId, session]
  );

  // =========================================================
  // Edit message
  // =========================================================

  const editMessage = useCallback(
    async (
      messageId: string,
      newText: string
    ) => {
      try {
        // Optimistic update

        setMessages(
          (prev: Message[]) =>
            prev.map((msg: Message) =>
              msg.id === messageId
                ? {
                  ...msg,
                  text:
                    newText.trim(),
                  edited: true,
                  editedAt:
                    new Date().toISOString(),
                }
                : msg
            )
        );

        const response =
          await messageService.editMessage(
            tripId,
            messageId,
            {
              text: newText.trim(),
            }
          );

        const editedMessage =
          response.data.data;


        setMessages(
          (prev: Message[]) =>
            prev.map((msg: Message) =>
              msg.id === messageId
                ? {
                  ...msg,

                  text:
                    editedMessage.text,

                  edited: true,

                  editedAt:
                    editedMessage.editedAt ||
                    new Date().toISOString(),
                }
                : msg
            )
        );

        toast.success(
          "Message edited"
        );
      } catch (error) {
        console.error(
          "❌ Error editing message:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to edit message"
        );

        // Refetch if edit failed

        try {
          const response =
            await messageService.getMessages(
              tripId
            );

          const fetchedMessages =
            response.data?.data || [];

          setMessages(
            fetchedMessages.map(
              mapApiMessageToMessage
            )
          );
        } catch (refetchError) {
          console.error(
            "❌ Error refetching messages:",
            refetchError
          );
        }
      }
    },
    [
      tripId,
      mapApiMessageToMessage,
    ]
  );

  // =========================================================
  // Delete message
  // =========================================================

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        // Optimistic update

        setMessages(
          (prev: Message[]) =>
            prev.map((msg: Message) =>
              msg.id === messageId
                ? {
                  ...msg,
                  text:
                    "This message was deleted",
                  deleted: true,
                }
                : msg
            )
        );

        await messageService.deleteMessage(
          tripId,
          messageId
        );

        toast.success(
          "Message deleted"
        );
      } catch (error) {
        console.error(
          "❌ Error deleting message:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete message"
        );

        // Refetch if delete failed

        try {
          const response =
            await messageService.getMessages(
              tripId
            );

          const fetchedMessages =
            response.data?.data || [];

          setMessages(
            fetchedMessages.map(
              mapApiMessageToMessage
            )
          );
        } catch (refetchError) {
          console.error(
            "❌ Error refetching messages:",
            refetchError
          );
        }
      }
    },
    [
      tripId,
      mapApiMessageToMessage,
    ]
  );

  // =========================================================
  // Typing indicator
  // =========================================================

  const sendTyping = useCallback(
    (
      isTyping: boolean,
      userName: string
    ) => {
      if (
        socketService.isConnected()
      ) {
        socketService.sendTyping(
          tripId,
          userName,
          isTyping
        );
      }
    },
    [tripId]
  );

  // =========================================================
  // Local system message
  // =========================================================

  const addSystemMessage =
    useCallback(
      (text: string) => {
        const systemMessage: Message = {
          id: `system-${Date.now()}`,
          sender: "System",
          text,

          timestamp:
            new Date().toLocaleTimeString(),

          isOwn: false,

          type: "system",

          senderImage: null,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),

          edited: false,

          deleted: false,

          metadata: null,
        };

        setMessages(
          (prev: Message[]) => [
            ...prev,
            systemMessage,
          ]
        );
      },
      [tripId]
    );

  // =========================================================
  // Local expense message
  // =========================================================

  const addExpenseMessage =
    useCallback(
      (
        text: string,
        senderName: string
      ) => {
        const expenseMessage: Message = {
          id: `expense-${Date.now()}`,

          sender: senderName,

          text,

          timestamp:
            new Date().toLocaleTimeString(),

          isOwn: false,

          type: "expense",

          senderImage: null,

          createdAt:
            new Date().toISOString(),

          updatedAt:
            new Date().toISOString(),

          edited: false,

          deleted: false,

          metadata: null,
        };

        setMessages(
          (prev: Message[]) => [
            ...prev,
            expenseMessage,
          ]
        );

      },
      [tripId]
    );

  // =========================================================
  // Return
  // =========================================================

  return {
    messages,
    isSending,
    isLoading,
    isConnected,
    typingUsers,

    sendMessage,
    editMessage,
    deleteMessage,

    sendTyping,

    addSystemMessage,
    addExpenseMessage,
  };
}