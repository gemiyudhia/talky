"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { AvatarSection } from "./AvatarSection";
import { EditableInput } from "./EditTableInput";
import { PINSection } from "./PinSection";
import { Separator } from "../ui/separator";
import { ActionButtons } from "./ActionButtons";
import { signOut } from "next-auth/react";

export default function ProfileInterface() {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>("John Doe");
  const [pin] = useState<string>("SFD239");

  const [tempName, setTempName] = useState<string>(name);

  const handleEdit = () => {
    setIsEditing(true);
    setTempName(name);
  };

  const handleSave = () => {
    setName(tempName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setTempName(name);
  };

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="w-full">
        <CardHeader className="bg-primary text-white p-6 relative">
          <Link href="/" className="absolute top-4 left-4">
            <ArrowLeft className="h-6 w-6 text-white" />
          </Link>
          <AvatarSection name={name} />
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <EditableInput
            label="Name"
            icon={<User className="h-5 w-5 text-gray-400" />}
            value={isEditing ? tempName : name}
            onChange={setTempName}
            disabled={!isEditing}
          />
          <PINSection pin={pin} />
        </CardContent>
        <Separator />
        <CardFooter>
          <ActionButtons
            isEditing={isEditing}
            onSave={handleSave}
            onCancel={handleCancel}
            onEdit={handleEdit}
            onLogout={handleLogout}
          />
        </CardFooter>
      </Card>
    </div>
  );
}
