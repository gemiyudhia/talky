import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Search, Settings, UserPlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Chat } from "@/types/Chat";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddFriendModal from "./AddFriendModal";
import FriendRequests from "./FriendRequests";
import { fetchFriends } from "@/lib/firebase/service";

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
        const friendList = await fetchFriends({userId: session.user.id});
        setFriends(friendList);
      };

      fetchAndSetFriends();
    }
  }, [session?.user.id]);

  return (
    <div
      className={`w-full border-r-[1px] md:w-[320px] lg:w-96 bg-white transition-all duration-300 ease-in-out ${
        activeChat ? "hidden md:block" : ""
      }`}
    >
      <div className="p-4 bg-primary flex justify-between items-center">
        <Avatar className="w-10 h-10 bg-white">
          <AvatarImage
            src="https://api.dicebear.com/6.x/micah/svg"
            alt="Your avatar"
          />
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="ml-3 text-white font-semibold">
            {session?.user.fullname}
          </h1>
        </div>
        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-primary-hover hover:text-white"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white">Search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-primary-hover hover:text-white"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-white">Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Tabs defaultValue="chats" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="chats" className="flex-1">
            Chats
          </TabsTrigger>
          <TabsTrigger value="friends" className="flex-1">
            Friends
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex-1">
            Requests
          </TabsTrigger>
        </TabsList>
        <TabsContent value="chats">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {chats.map((chat) => (
              <button
                key={chat.id}
                className="w-full p-4 text-left hover:bg-gray-100 flex items-center space-x-4 transition-colors duration-200"
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
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">{chat.name}</span>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <span className="bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </button>
            ))}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="friends">
          <div className="p-4">
            <Button
              onClick={() => setIsAddFriendModalOpen(true)}
              className="w-full bg-primary hover:bg-primary-hover"
            >
              <UserPlus className="mr-2 h-4 w-4 text-white" />
              <p className="text-white">Add Friend</p>
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-16rem)]">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/micah/svg?seed=${friend.id}`}
                    />
                    <AvatarFallback>{friend.fullname[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{friend.fullname}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                You have no friends yet.
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="requests">
          <FriendRequests />
        </TabsContent>
      </Tabs>
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        currentUserId={session?.user.id || ""}
      />
    </div>
  );
};

export default Sidebar;
