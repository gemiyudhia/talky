import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AvatarSectionProps = {
  children: ReactNode;
  fullname: string;
  className?: string;
  onAvatarChange?: (file: File) => void;
};

export const AvatarSection = ({
  children,
  fullname,
  className,
  onAvatarChange,
}: AvatarSectionProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarChange) {
      onAvatarChange(file);
    }
  };

  const getInitials = (name: string) => {
    const names = name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage
            src={`https://api.dicebear.com/6.x/micah/svg?seed=${
              fullname || "user"
            }`}
            alt="Profile picture"
            className="object-cover"
          />
          <AvatarFallback className="text-2xl bg-primary text-white">
            {fullname ? getInitials(fullname) : "PP"}
          </AvatarFallback>
        </Avatar>

        {/* Edit overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/50">
          <input
            type="file"
            accept="image/*"
            id="avatar-upload"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
            aria-label="Change profile picture"
          >
            <Camera className="h-5 w-5 text-gray-800" />
          </label>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center text-primary-foreground">
        {children}
      </h1>
    </div>
  );
};
