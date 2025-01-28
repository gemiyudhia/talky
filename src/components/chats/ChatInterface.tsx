"use client";

import { useEffect, useState } from "react";
import { ProfileSetting } from "./ProfileSetting";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { useSession } from "next-auth/react";
import { subscribeToMessages } from "@/lib/firebase/service";
import { Message } from "@/types/Message";

export default function ChatInterface() {
  const {data: session} = useSession()
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [chatList, setChatList] = useState<Message[]>([]);

useEffect(() => {
  if (!session?.user?.id) return;

  // Subscribe to user's chats
  const unsubscribe = subscribeToMessages(session.user.id, (updatedChats) => {
    return setChatList(updatedChats);
  });

  return () => unsubscribe();
}, [session?.user?.id]);

  return (
    <div className="flex h-full overflow-hidden bg-gray-100 rounded-xl shadow-xl">
      <Sidebar
        chats={chatList}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        setShowSettings={setShowSettings}
        setChats={setChatList}
      />
      <ChatArea
        activeChat={activeChat}
        chats={chatList}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        setActiveChat={setActiveChat}
      />
      <ProfileSetting
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
