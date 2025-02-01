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
import { sendMessage, subscribeToMessages } from "@/lib/firebase/service";
import { useSession } from "next-auth/react";

type ChatAreaProps = {
  activeChat: string | null;
  chats: Message[];
  messageInput: string;
  setMessageInput: (input: string) => void;
  setActiveChat: (id: string | null) => void;
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
    if (!activeChat) return;

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(
      activeChat.toString(),
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [activeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !session?.user?.id || !activeChat) return;

    try {
      await sendMessage(activeChat.toString(), session.user.id, messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const isMessageSentByUser = (senderId: string) => {
    return senderId === session?.user?.id;
  };

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
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col h-full overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
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
                  src={`https://api.dicebear.com/6.x/micah/svg?seed=${
                    chats.find((c) => c.id === activeChat)?.name
                  }`}
                />
                <AvatarFallback>
                  {chats.find((c) => c.id === activeChat)?.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">
                  {chats.find((c) => c.id === activeChat)?.name}
                </h2>
                <p className="text-sm text-gray-200">
                  {chats.find((c) => c.id === activeChat)?.online
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </motion.div>
            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              <div className="flex flex-col min-h-full">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        isMessageSentByUser(message.senderId)
                          ? "justify-end"
                          : "justify-start"
                      } mb-4`}
                    >
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isMessageSentByUser(message.senderId)
                            ? "bg-primary text-white"
                            : "bg-white"
                        } shadow-md`}
                      >
                        {!isMessageSentByUser(message.senderId) &&
                          index > 0 &&
                          isMessageSentByUser(messages[index - 1].senderId) && (
                            <p className="text-xs text-gray-500 mb-1">
                              {chats.find((c) => c.id === activeChat)?.name}
                            </p>
                          )}
                        <p>{message.content}</p>
                        <p
                          className={`text-xs ${
                            isMessageSentByUser(message.senderId)
                              ? "text-gray-200"
                              : "text-gray-500"
                          } text-right mt-1`}
                        >
                          {message.timestamp && message.timestamp.toDate
                            ? new Date(
                                message.timestamp.toDate()
                              ).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Invalid date"}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                    transition={{ duration: 0.2 }}
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
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
