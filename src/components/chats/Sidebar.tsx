import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Search, Settings, MessageCircle, Users, UserPlus } from "lucide-react";
import type { Chat } from "@/types/Chat";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddFriendModal from "./AddFriendModal";
import FriendRequests from "./FriendRequests";
import { fetchFriends } from "@/lib/firebase/service";
import FriendsList from "./FriendsList";
import ChatList from "./ChatList";
import { motion, AnimatePresence } from "framer-motion";

type SidebarProps = {
  chats: Chat[];
  activeChat: number | null;
  setActiveChat: (id: number | null) => void;
  setShowSettings: (show: boolean) => void;
};

const Sidebar = ({
  chats,
  activeChat,
  setActiveChat,
  setShowSettings,
}: SidebarProps) => {
  const { data: session } = useSession();
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [friends, setFriends] = useState<{ id: string; fullname: string }[]>(
    []
  );

  useEffect(() => {
    if (session?.user.id) {
      const fetchAndSetFriends = async () => {
        const friendList = await fetchFriends({ userId: session.user.id });
        setFriends(friendList);
      };

      fetchAndSetFriends();
    }
  }, [session?.user.id]);

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`w-full border-r border-gray-200 md:w-[320px] lg:w-96 bg-white transition-all duration-300 ease-in-out ${
        activeChat ? "hidden md:block" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-primary flex justify-between items-center"
      >
        <Avatar className="w-10 h-10 border-2 border-white">
          <AvatarImage
            src={`https://api.dicebear.com/6.x/micah/svg?seed=${session?.user.id}`}
            alt="Your avatar"
          />
          <AvatarFallback>{session?.user.fullname?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 ml-3">
          <h1 className="text-white font-semibold truncate">
            {session?.user.fullname}
          </h1>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-primary-hover hover:text-white transition-colors duration-200"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-primary-hover hover:text-white transition-colors duration-200"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
      <Tabs defaultValue="chats" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-gray-100">
          <TabsTrigger value="chats" className="data-[state=active]:bg-white">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chats
          </TabsTrigger>
          <TabsTrigger value="friends" className="data-[state=active]:bg-white">
            <Users className="w-4 h-4 mr-2" />
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="requests"
            className="data-[state=active]:bg-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Requests
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="chats" key="chats">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ChatList
                chats={chats}
                activeChat={activeChat}
                setActiveChat={setActiveChat}
              />
            </motion.div>
          </TabsContent>
          <TabsContent value="friends" key="friends">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FriendsList
                friends={friends}
                onAddFriend={() => setIsAddFriendModalOpen(true)}
              />
            </motion.div>
          </TabsContent>
          <TabsContent value="requests" key="requests">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FriendRequests />
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        currentUserId={session?.user.id || ""}
      />
    </motion.div>
  );
};

export default Sidebar;
