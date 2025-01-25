"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, UserPlus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  fetchPendingFriendRequests,
  handleFriendRequests,
} from "@/lib/firebase/service";
import type { FriendRequest } from "@/types/FriendRequest";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const FriendRequests = () => {
  const { data: session } = useSession();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        const request = await fetchPendingFriendRequests({
          userId: session.user.id,
        });

        setFriendRequests(request || []);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [session?.user?.id]);

  const handleFriendRequestAction = async (
    userId: string,
    action: "accept" | "reject"
  ) => {
    if (!session?.user?.id) return;

    try {
      await handleFriendRequests(session.user.id, userId, action);

      setFriendRequests((prevRequests) =>
        prevRequests.filter((request) => request.fromUserId !== userId)
      );
    } catch (error) {
      console.error(`Failed to ${action} friend request:`, error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)] px-4">
      <AnimatePresence>
        {friendRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 text-center text-gray-500 bg-gray-100 rounded-lg"
          >
            <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No friend requests</p>
            <p className="mt-2">
              When you receive a request, it will appear here.
            </p>
          </motion.div>
        ) : (
          friendRequests.map((request) => (
            <motion.div
              key={request.fromUserId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center justify-between p-4 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.avatarUrl} alt={request.fullname} />
                  <AvatarFallback>{request.fullname[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-lg">
                    {request.fullname}
                  </span>
                  <p className="text-sm text-gray-500">
                    Wants to be your friend
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:text-green-700 hover:bg-green-100 transition-colors duration-200"
                        onClick={() =>
                          handleFriendRequestAction(
                            request.fromUserId,
                            "accept"
                          )
                        }
                      >
                        <Check className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Accept friend request</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100 transition-colors duration-200"
                        onClick={() =>
                          handleFriendRequestAction(
                            request.fromUserId,
                            "reject"
                          )
                        }
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reject friend request</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </motion.div>
          ))
        )}
      </AnimatePresence>
    </ScrollArea>
  );
};

export default FriendRequests;
