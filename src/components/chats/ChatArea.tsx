"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { ArrowLeft, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ScrollArea } from "../ui/scroll-area";
import { Input } from "../ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import type { Message } from "@/types/Message";
import { useSession } from "next-auth/react";
import { Timestamp } from "firebase/firestore";
import { initSocket, type Socket } from "@/lib/socket";

type ChatAreaProps = {
  activeChat: string | null;
  chats: Message[];
  messageInput: string;
  setMessageInput: (input: string) => void;
  setActiveChat: (id: string | null) => void;
};

const parseMessageTimestamp = (timestamp: Timestamp | Date) => {
  if (!timestamp) return null;

  // Handle Firestore Timestamp format
  if (timestamp instanceof Date) {
    return timestamp;
  }

  if (
    typeof timestamp === "object" &&
    "seconds" in timestamp &&
    "nanoseconds" in timestamp
  ) {
    return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  }

  try {
    return new Date(timestamp);
  } catch (e) {
    console.log(e);
    console.error("Invalid timestamp:", timestamp);
    return null;
  }
};

const ChatArea = ({
  activeChat,
  chats,
  messageInput,
  setMessageInput,
  setActiveChat,
}: ChatAreaProps) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Inisialisasi Socket
    socketRef.current = initSocket();

    // Setup socket event listeners
    socketRef.current.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    // Tambahkan listener untuk event koneksi
    socketRef.current.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Disconnected from socket server");
    });

    socketRef.current.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("new-message");
        socketRef.current.disconnect();
      }
    };
  }, [scrollToBottom]);

  useEffect(() => {
    if (!activeChat) return;

    const setupEventSource = () => {
      // Tutup koneksi yang ada sebelum membuat yang baru
      eventSourceRef.current?.close();

      // Buat EventSource baru dengan timestamp untuk mencegah caching
      const es = new EventSource(
        `/api/messages/subscribe?chatId=${activeChat}&t=${Date.now()}`
      );
      eventSourceRef.current = es;

      const handleMessage = (event: MessageEvent) => {
        try {
          const newMessages: Message[] = JSON.parse(event.data);
          setMessages(newMessages);
          scrollToBottom();
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      const handleError = (error: Event) => {
        console.error("EventSource error:", error);
        es.close();

        // Coba hubungkan kembali setelah jeda
        setTimeout(setupEventSource, 1000);
      };

      es.onmessage = handleMessage;
      es.onerror = handleError;
    };

    setupEventSource();

    // Cleanup saat component unmount atau activeChat berubah
    return () => {
      eventSourceRef.current?.close();
    };
  }, [activeChat, scrollToBottom]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !session?.user?.id || !activeChat) return;

    // Generate temporary ID and timestamp
    const tempMessageId = `temp-${Date.now()}`;
    const tempTimestamp = {
      seconds: Math.floor(Date.now() / 1000),
      nanoseconds: (Date.now() % 1000) * 1000000,
    };

    const tempMessage: Message = {
      id: tempMessageId,
      content: messageInput,
      name: session.user.fullname || "User",
      senderId: session.user.id,
      timestamp: tempTimestamp as Timestamp,
      read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setMessageInput("");
    scrollToBottom();

    try {
      // Persiapkan data sesuai dengan yang dibutuhkan API
      const messageData = {
        chatId: activeChat,
        userId: session.user.id,
        content: messageInput,
      };

      // Emit message melalui socket
      const socketMessage = {
        ...messageData,
        id: Date.now().toString(),
        timestamp: new Date(),
      };
      socketRef.current?.emit("send-message", socketMessage);

      // Kirim pesan ke server
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
        throw new Error(errorData.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const isMessageSentByUser = (senderId: string) => {
    return senderId === session?.user?.id;
  };

  const activeChatData = chats.find((c) => c.id === activeChat);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ease-in-out ${
        !activeChat ? "hidden md:flex" : ""
      } md:w-[calc(100%-320px)] lg:w-[calc(100%-24rem)]`}
    >
      <AnimatePresence mode="wait">
        {activeChat ? (
          <motion.div
            key="active-chat"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 bg-primary flex items-center space-x-4"
            >
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-primary-hover"
                onClick={() => setActiveChat(null)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Avatar className="w-10 h-10 bg-white">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/micah/svg?seed=${activeChatData?.name}`}
                />
                <AvatarFallback>
                  {activeChatData?.name?.[0] || "C"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  {activeChatData?.name || "Chat"}
                </h2>
                <p className="text-sm text-gray-200">
                  {activeChatData?.online ? "Online" : "Offline"}
                </p>
              </div>
            </motion.div>

            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              <div className="flex flex-col min-h-full">
                <AnimatePresence>
                  {messages.map((message) => {
                    const timestamp = parseMessageTimestamp(message.timestamp);
                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${
                          isMessageSentByUser(message.senderId)
                            ? "justify-end"
                            : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            isMessageSentByUser(message.senderId)
                              ? "bg-primary text-white"
                              : "bg-white"
                          } shadow-md`}
                        >
                          <p>{message.content}</p>
                          {timestamp && (
                            <p className="text-xs mt-1 opacity-70">
                              {timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSendMessage}
              className="p-4 bg-white flex items-center space-x-2 shrink-0"
            >
              <Input
                placeholder="Type a message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 py-5"
              />
              <AnimatePresence>
                {messageInput && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="submit"
                            size="icon"
                            className="bg-primary hover:bg-primary-hover text-white"
                          >
                            <Send className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Send message</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </motion.div>
        ) : (
          <motion.div
            key="no-active-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center bg-gray-100"
          >
            <p className="text-gray-500">Select a chat to start messaging</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatArea;
