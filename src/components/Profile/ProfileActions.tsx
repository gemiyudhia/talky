"use client";

import React from "react";
import { Button } from "../ui/button";
import { signOut } from "next-auth/react";

const ProfileActions = () => {
  return (
    <div>
      <Button onClick={() => signOut()}>Logout</Button>
    </div>
  );
};

export default ProfileActions;
