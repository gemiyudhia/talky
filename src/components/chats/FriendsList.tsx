import type React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Friend = {
  id: string;
  fullname: string;
};

type FriendsListProps = {
  friends: Friend[];
  onAddFriend: () => void;
};

const FriendsList: React.FC<FriendsListProps> = ({ friends, onAddFriend }) => {
  return (
    <div>
      <div className="p-4">
        <Button
          onClick={onAddFriend}
          className="w-full bg-primary hover:bg-primary-hover transition-colors duration-200"
        >
          <UserPlus className="mr-2 h-4 w-4 text-white" />
          <span className="text-white">Add Friend</span>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <AnimatePresence>
          {friends.length > 0 ? (
            friends.map((friend) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4 flex items-center space-x-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/6.x/micah/svg?seed=${friend.id}`}
                  />
                  <AvatarFallback>{friend.fullname[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{friend.fullname}</p>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 text-center text-gray-500 text-sm"
            >
              You have no friends yet.
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};

export default FriendsList;
