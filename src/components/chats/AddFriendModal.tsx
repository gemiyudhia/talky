import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { addFriend } from "@/lib/friend/friend";

type AddFriendModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
};

const AddFriendModal = ({
  isOpen,
  onClose,
  currentUserId,
}: AddFriendModalProps) => {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await addFriend(pin, currentUserId);

      if (result.success) {
        alert("Friend added successfully");
        setPin("");
        onClose();
      } else {
        alert(result.message || "Failed to add friend");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to add friend");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
          <DialogDescription>
            Enter your friend&apos;s PIN to send them a friend request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pin" className="text-right">
                PIN
              </Label>
              <Input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="col-span-3"
                placeholder="Input PIN"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary-hover"
            >
              <UserPlus className="mr-2 h-4 w-4 text-white" />
              <p className="text-white">
                {isLoading ? "Adding..." : "Add Friend"}
              </p>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
