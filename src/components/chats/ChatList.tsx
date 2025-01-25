import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import type { Chat } from "@/types/Chat";

type ChatListProps = {
  chats: Chat[];
  activeChat: number | null;
  setActiveChat: (id: number | null) => void;
};

const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChat,
  setActiveChat,
}) => {
  return (
    <ScrollArea className="h-[calc(100vh-12rem)]">
      <AnimatePresence>
        {chats.map((chat) => (
          <motion.button
            key={chat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`w-full p-4 text-left hover:bg-gray-100 flex items-center space-x-4 transition-colors duration-200 ${
              activeChat === chat.id ? "bg-gray-100" : ""
            }`}
            onClick={() => setActiveChat(chat.id)}
          >
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={`https://api.dicebear.com/6.x/micah/svg?seed=${chat.name}`}
                />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              {chat.online && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                ></motion.span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold truncate">{chat.name}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {chat.time}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {chat.lastMessage}
              </p>
            </div>
            {chat.unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0"
              >
                {chat.unread}
              </motion.span>
            )}
          </motion.button>
        ))}
      </AnimatePresence>
    </ScrollArea>
  );
};

export default ChatList;
