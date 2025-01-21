import React, { useEffect, useRef } from "react";
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
import { Message } from "@/types/Message";
import { Chat } from "@/types/Chat";

type ChatAreaProps = {
  activeChat: number | null;
  chats: Chat[];
  messages: Message[];
  messageInput: string;
  setMessageInput: (input: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  setActiveChat: (id: number | null) => void;
}

const ChatArea = ({
  activeChat,
  chats,
  messages,
  messageInput,
  setMessageInput,
  handleSendMessage,
  setActiveChat,
}: ChatAreaProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div
      className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        !activeChat ? "hidden md:flex" : ""
      } md:w-[calc(100%-320px)] lg:w-[calc(100%-24rem)]`}
    >
      {activeChat ? (
        <>
          <div className="p-3 bg-primary flex items-center space-x-4">
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
          </div>
          <ScrollArea className="flex-1 p-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isSent ? "justify-end" : "justify-start"
                } mb-4 animate-fade-in`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.isSent ? "bg-primary text-white" : "bg-white"
                  } shadow-md`}
                >
                  {!message.isSent &&
                    index > 0 &&
                    messages[index - 1].isSent && (
                      <p className="text-xs text-gray-500 mb-1">
                        {message.sender}
                      </p>
                    )}
                  <p>{message.content}</p>
                  <p
                    className={`text-xs ${
                      message.isSent ? "text-gray-200" : "text-gray-500"
                    } text-right mt-1`}
                  >
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white flex items-center space-x-2"
          >
            <Input
              placeholder="Type a message"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="flex-1 py-5"
            />
            {messageInput && (
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
            )}
          </form>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-100">
          <p className="text-gray-500">Select a chat to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
