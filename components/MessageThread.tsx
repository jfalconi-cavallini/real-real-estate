"use client";

import { useState, useEffect, useRef } from "react";

interface Message {
    id: string;
    body: string;
    senderId: string;
    createdAt: string;
}

export default function MessageThread({
    currentUserId,
    partnerId,
    partnerName,
    initialMessages,
}: {
    currentUserId: string;
    partnerId: string;
    partnerName: string;
    initialMessages: Message[];
}) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function sendMessage() {
        if (!body.trim()) return;
        setSending(true);

        const res = await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: partnerId, body }),
        });

        const data = await res.json();
        if (res.ok) {
            setMessages((prev) => [
                ...prev,
                { id: data.id, body: data.body, senderId: data.senderId, createdAt: data.createdAt },
            ]);
            setBody("");
        }
        setSending(false);
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white">

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <p className="text-base font-semibold text-black">{partnerName}</p>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
                {messages.length === 0 && (
                    <p className="text-black text-sm text-center mt-10">
                        No messages yet. Say hello!
                    </p>
                )}
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`px-4 py-2.5 rounded-2xl text-sm max-w-sm break-words ${isMe
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-black border border-gray-200"
                                    }`}
                            >
                                {msg.body}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input pinned at bottom */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 items-center">
                <input
                    type="text"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={`Message ${partnerName}...`}
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={sendMessage}
                    disabled={sending || !body.trim()}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
                >
                    {sending ? "..." : "Send"}
                </button>
            </div>

        </div>
    );
}