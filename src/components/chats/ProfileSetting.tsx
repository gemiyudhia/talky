import { useState } from "react";
import { X, Moon, Sun, UserCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

interface ProfileSettingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSetting({ isOpen, onClose }: ProfileSettingProps) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserCircle className="h-6 w-6 text-primary" />
              <Label htmlFor="profile">Profile</Label>
            </div>
            <Button variant="outline">
              <Link href="/profile">Edit</Link>
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {darkMode ? (
                <Moon className="h-6 w-6 text-primary" />
              ) : (
                <Sun className="h-6 w-6 text-primary" />
              )}
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
