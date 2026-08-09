import { useCallback, useEffect, useRef, useState } from "react";
import { Message } from "@/types/trip.types";

export function useChatScroll(messages: Message[]) {
    const containerRef =
        useRef<HTMLDivElement>(null);

    const messagesEndRef =
        useRef<HTMLDivElement>(null);

    const prevMessagesLength =
        useRef(messages.length);

    const [isAutoScrollEnabled, setIsAutoScrollEnabled] =
        useState(true);

    const [showScrollButton, setShowScrollButton] =
        useState(false);

    const [initialLoadComplete, setInitialLoadComplete] =
        useState(false);

    const [isAtBottom, setIsAtBottom] =
        useState(true);

    // ------------------------------------------
    // Check whether user is near bottom
    // ------------------------------------------

    const checkIfAtBottom = useCallback(() => {
        if (!containerRef.current) return true;

        const {
            scrollTop,
            scrollHeight,
            clientHeight,
        } = containerRef.current;

        const threshold = 100;

        return (
            scrollHeight -
            scrollTop -
            clientHeight <
            threshold
        );
    }, []);

    // ------------------------------------------
    // Scroll to bottom
    // ------------------------------------------

    const scrollToBottom = useCallback(
        (
            behavior: "smooth" | "instant" = "smooth"
        ) => {
            messagesEndRef.current?.scrollIntoView({
                behavior,
                block: "end",
            });
        },
        []
    );

    // ------------------------------------------
    // Handle manual scrolling
    // ------------------------------------------

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const atBottom = checkIfAtBottom();

        setIsAtBottom(atBottom);

        setShowScrollButton(
            !atBottom && messages.length > 0
        );

        setIsAutoScrollEnabled(atBottom);
    }, [
        checkIfAtBottom,
        messages.length,
    ]);

    // ------------------------------------------
    // Handle new messages
    // ------------------------------------------

    useEffect(() => {
        if (messages.length === 0) return;

        const newMessageCount =
            messages.length -
            prevMessagesLength.current;

        const isNewMessage =
            newMessageCount > 0;

        // Initial load
        if (!initialLoadComplete) {
            const savedScrollTop =
                sessionStorage.getItem(
                    "chat-scroll"
                );

            if (
                savedScrollTop &&
                containerRef.current
            ) {
                containerRef.current.scrollTop =
                    parseInt(
                        savedScrollTop,
                        10
                    );

                setInitialLoadComplete(true);

                setTimeout(() => {
                    const atBottom =
                        checkIfAtBottom();

                    setIsAtBottom(atBottom);
                    setIsAutoScrollEnabled(
                        atBottom
                    );
                    setShowScrollButton(
                        !atBottom
                    );
                }, 100);
            } else {
                scrollToBottom("instant");

                setInitialLoadComplete(true);
                setIsAutoScrollEnabled(true);
                setIsAtBottom(true);
                setShowScrollButton(false);
            }

            prevMessagesLength.current =
                messages.length;

            return;
        }

        // New message arrived
        if (isNewMessage) {
            const lastMessage =
                messages[messages.length - 1];

            const isUserMessage =
                lastMessage?.isOwn || false;

            const isSystemMessage =
                lastMessage?.type === "system" ||
                lastMessage?.sender === "System";

            const shouldAutoScroll =
                isAutoScrollEnabled ||
                isUserMessage ||
                isSystemMessage ||
                isAtBottom;

            if (shouldAutoScroll) {
                const behavior =
                    isUserMessage
                        ? "smooth"
                        : "instant";

                scrollToBottom(behavior);

                setIsAutoScrollEnabled(true);
                setIsAtBottom(true);
                setShowScrollButton(false);
            } else {
                setShowScrollButton(true);
            }
        }

        prevMessagesLength.current =
            messages.length;
    }, [
        messages,
        initialLoadComplete,
        isAutoScrollEnabled,
        scrollToBottom,
        checkIfAtBottom,
        isAtBottom,
    ]);

    // ------------------------------------------
    // Save scroll position
    // ------------------------------------------

    useEffect(() => {
        const saveScrollPosition = () => {
            if (
                containerRef.current &&
                messages.length > 0
            ) {
                sessionStorage.setItem(
                    "chat-scroll",
                    containerRef.current.scrollTop.toString()
                );
            }
        };

        window.addEventListener(
            "beforeunload",
            saveScrollPosition
        );

        document.addEventListener(
            "visibilitychange",
            saveScrollPosition
        );

        return () => {
            window.removeEventListener(
                "beforeunload",
                saveScrollPosition
            );

            document.removeEventListener(
                "visibilitychange",
                saveScrollPosition
            );
        };
    }, [messages.length]);

    // ------------------------------------------
    // Re-enable auto scroll when at bottom
    // ------------------------------------------

    useEffect(() => {
        if (
            isAtBottom &&
            !isAutoScrollEnabled
        ) {
            setIsAutoScrollEnabled(true);
            setShowScrollButton(false);
        }
    }, [
        isAtBottom,
        isAutoScrollEnabled,
    ]);

    // ------------------------------------------
    // Jump to latest
    // ------------------------------------------

    const handleJumpToBottom =
        useCallback(() => {
            scrollToBottom("smooth");

            setIsAutoScrollEnabled(true);
            setIsAtBottom(true);
            setShowScrollButton(false);
        }, [scrollToBottom]);

    return {
        containerRef,
        messagesEndRef,

        showScrollButton,

        handleScroll,
        handleJumpToBottom,
        scrollToBottom,

        isAtBottom,
        isAutoScrollEnabled,
    };
}