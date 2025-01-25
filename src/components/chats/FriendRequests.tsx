import type React from "react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  fetchPendingFriendRequests,
  handleFriendRequests, 
} from "@/lib/firebase/service";
import { FriendRequest } from "@/types/FriendRequest";

const FriendRequests = () => {
  const { data: session } = useSession();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user?.id) return;

      const request = await fetchPendingFriendRequests({
        userId: session.user.id,
      });

       console.log("Fetched Friend Requests:", request);

      if (request) {
         console.log("Received Friend Requests:", request);
        setFriendRequests(request);
      } else {
        setFriendRequests([]);
      }
    };

    fetchRequests();
  }, [session?.user?.id]);

  const handleFriendRequestAction = async (
    userId: string,
    action: "accept" | "reject"
  ) => {
    if (!session?.user?.id) return;

    await handleFriendRequests(session.user.id, userId, action);

    setFriendRequests((prevRequests) =>
      prevRequests.filter((request) => request.fromUserId !== userId)
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      {friendRequests.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No pending friend requests
        </div>
      ) : (
        friendRequests.map((request) => (
          <div
            key={request.fromUserId}
            className="flex items-center justify-between p-4 hover:bg-gray-100"
          >
            <div className="flex items-center space-x-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={request.avatarUrl} alt={request.fullname} />
                <AvatarFallback>{request.fullname[0]}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{request.fullname}</span>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700 hover:bg-green-100"
                onClick={() =>
                  handleFriendRequestAction(request.fromUserId, "accept")
                }
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                onClick={() =>
                  handleFriendRequestAction(request.fromUserId, "reject")
                }
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </ScrollArea>
  );
};

export default FriendRequests;
