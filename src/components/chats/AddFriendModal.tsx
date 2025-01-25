"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { UserPlus, Check, AlertCircle } from "lucide-react";
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
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePinChange = (index: number, value: string) => {
    const newPin = [...pin];
    newPin[index] = value.toUpperCase();
    setPin(newPin);

    // Move focus to the next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    try {
      const result = await addFriend(pin.join(""), currentUserId);

      if (result.success) {
        setStatus("success");
        setTimeout(() => {
          setPin(["", "", "", "", "", ""]);
          onClose();
        }, 2000);
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add Friend</DialogTitle>
          <DialogDescription>
            Enter your friend&apos;s 6-character alphanumeric PIN to send them a
            friend request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="flex justify-center space-x-4">
              {pin.map((digit, index) => (
                <Input
                  key={index}
                  id={`pin-${index}`}
                  pattern="[a-zA-Z0-9]{1}"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  className="w-12 h-12 text-center text-2xl font-bold uppercase"
                  required
                />
              ))}
            </div>
            <AnimatePresence>
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-center text-red-500"
                >
                  <AlertCircle className="mr-2" />
                  <span>Failed to request friend. Please try again.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || pin.some((digit) => !digit)}
              className={`w-full transition-all duration-300 ${
                status === "success"
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-primary hover:bg-primary-hover"
              }`}
            >
              {status === "success" ? (
                <Check className="mr-2 h-5 w-5 text-white" />
              ) : (
                <UserPlus className="mr-2 h-5 w-5 text-white" />
              )}
              <p className="text-white text-lg">
                {isLoading
                  ? "Adding..."
                  : status === "success"
                  ? "Friend Added!"
                  : "Add Friend"}
              </p>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
