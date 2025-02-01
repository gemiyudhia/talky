"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AvatarSection } from "./AvatarSection";
import { PINSection } from "./PinSection";
import { Separator } from "../ui/separator";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../ui/button";

export default function ProfileInterface() {
  const { data: session } = useSession();

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
          <AvatarSection fullname={session?.user.fullname || ""}>
            {session?.user.fullname}
          </AvatarSection>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <PINSection>{session?.user.pin}</PINSection>
        </CardContent>
        <Separator />
        <CardFooter>
          <Button
            className="w-full bg-secondary hover:bg-secondary-hover text-white font-semibold hover:text-white"
            variant="outline"
            onClick={() => handleLogout}
          >
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
