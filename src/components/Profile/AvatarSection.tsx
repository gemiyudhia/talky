import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

export const AvatarSection = ({ name }: { name: string }) => {
  return (
    <div className="relative flex flex-col items-center">
      <div className="">
        <Avatar className="w-24 h-24 border-4 border-white">
          <AvatarImage src="/placeholder-avatar.jpg" alt="Profile picture" />
          <AvatarFallback className="text-2xl">Profile Picture</AvatarFallback>
        </Avatar>
        <Button
          variant="secondary"
          size="icon"
          className="absolute inset-0 m-auto h-8 w-8 transform translate-x-1/2 top-3 -right-9 rounded-full shadow bg-secondary"
        >
          <Camera className="h-4 w-4 text-white" />
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-center mt-6">{name}</h1>
    </div>
  );
};
