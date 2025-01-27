"use client";

import { useState } from "react";
import { ProfileSetting } from "./ProfileSetting";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

const initialChats = [
  {
    id: 1,
    name: "Alice Johnson",
    lastMessage: "Hey, how are you?",
    time: "10:30 AM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    lastMessage: "Can we meet tomorrow?",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Charlie Brown",
    lastMessage: "Thanks for the help!",
    time: "Tuesday",
    unread: 0,
    online: true,
  },
  {
    id: 4,
    name: "David Lee",
    lastMessage: "See you soon!",
    time: "Monday",
    unread: 1,
    online: false,
  },
];

const messages = [
  {
    id: 1,
    sender: "Alice Johnson",
    content: "Hey there! How's it going?",
    timestamp: "10:00 AM",
    isSent: false,
  },
  {
    id: 2,
    sender: "You",
    content: "Hi Alice! I'm doing great, thanks for asking. How about you?",
    timestamp: "10:02 AM",
    isSent: true,
  },
  {
    id: 3,
    sender: "Alice Johnson",
    content: "I'm good too! Just working on some new projects.",
    timestamp: "10:05 AM",
    isSent: false,
  },
  {
    id: 4,
    sender: "You",
    content:
      "That sounds interesting! What kind of projects are you working on?",
    timestamp: "10:07 AM",
    isSent: true,
  },
  {
    id: 5,
    sender: "Alice Johnson",
    content:
      "I'm developing a new chat application using React and TypeScript. It's been challenging but fun!",
    timestamp: "10:10 AM",
    isSent: false,
  },
];

export default function ChatInterface() {
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [chatList, setChatList] = useState(initialChats);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      // Here you would typically send the message to your backend
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

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
        messages={messages}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={handleSendMessage}
        setActiveChat={setActiveChat}
      />
      <ProfileSetting
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}
