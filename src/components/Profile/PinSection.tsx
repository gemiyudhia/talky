import { Key } from "lucide-react";
import { Label } from "../ui/label";

export const PINSection = ({ pin }: { pin: string }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-500">PIN</Label>
      <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-md border border-green-300">
        <Key className="h-5 w-5 text-green-500" />
        <p className="text-sm font-bold tracking-wider">{pin}</p>
      </div>
    </div>
  );
};
