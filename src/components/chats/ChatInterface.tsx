"use client";

import { useEffect, useState } from "react";
import { ProfileSetting } from "./ProfileSetting";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { useSession } from "next-auth/react";
import { Message } from "@/types/Message";

export default function ChatInterface() {
  const { data: session } = useSession();
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [chatList, setChatList] = useState<Message[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Gunakan Server-Sent Events (SSE) untuk langganan real-time
    const eventSource = new EventSource(
      `/api/messages?userId=${session.user.id}`
    );

    eventSource.onmessage = (event) => {
      try {
        const newChat: Message = JSON.parse(event.data);
        setChatList((prev) => [...prev, newChat]); // Tambahkan chat baru ke daftar
      } catch (error) {
        console.error("Error parsing chat:", error);
      }
    };

    eventSource.onerror = () => {
      console.error("Error in event source");
      eventSource.close();
    };

    return () => eventSource.close();
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
