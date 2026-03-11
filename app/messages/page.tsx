import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import MessageThread from "@/components/MessageThread";

export default async function MessagesPage({
    searchParams,
}: {
    searchParams: Promise<{ to?: string; name?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");
    const userId = session.user.id;

    const { to } = await searchParams;

    const messages = await prisma.message.findMany({
        where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
        },
        include: { sender: true, receiver: true },
        orderBy: { createdAt: "asc" },
    });

    const partnerMap = new Map<string, { id: string; name: string | null; email: string | null }>();
    for (const msg of messages) {
        const partner = msg.senderId === userId ? msg.receiver : msg.sender;
        if (!partnerMap.has(partner.id)) partnerMap.set(partner.id, partner);
    }

    if (to && !partnerMap.has(to)) {
        const user = await prisma.user.findUnique({ where: { id: to } });
        if (user) partnerMap.set(user.id, user);
    }

    const partners = Array.from(partnerMap.values());
    const activePartnerId = to ?? partners[0]?.id ?? null;
    const activePartner = partnerMap.get(activePartnerId ?? "") ?? null;

    const thread = activePartnerId
        ? messages.filter(
            (m) =>
                (m.senderId === session.user.id && m.receiverId === activePartnerId) ||
                (m.senderId === activePartnerId && m.receiverId === session.user.id)
        )
        : [];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                <h1 className="text-2xl font-bold text-black mb-6">Messages</h1>
                <div
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex"
                    style={{ height: "620px" }}
                >
                    {/* Sidebar */}
                    <div className="w-64 border-r border-gray-200 flex flex-col flex-shrink-0 bg-white">
                        <div className="px-4 py-4 border-b border-gray-200">
                            <p className="text-sm font-semibold text-black">Conversations</p>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {partners.length === 0 && (
                                <p className="text-black text-xs p-4">No conversations yet.</p>
                            )}
                            {partners.map((partner) => {
                                const isActive = activePartnerId === partner.id;
                                return (
                                    <Link
                                        key={partner.id}
                                        href={`/messages?to=${partner.id}`}
                                        className={`flex items-center px-4 py-3.5 border-b border-gray-100 transition-colors hover:bg-gray-50 ${isActive ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                                            }`}
                                    >
                                        <p className={`text-sm text-black truncate ${isActive ? "font-semibold" : "font-normal"}`}>
                                            {partner.name ?? partner.email}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Thread */}
                    {activePartner ? (
                        <MessageThread
                            currentUserId={userId}
                            partnerId={activePartner.id}
                            partnerName={activePartner.name ?? activePartner.email ?? "Unknown"}
                            initialMessages={thread.map((m) => ({
                                id: m.id,
                                body: m.body,
                                senderId: m.senderId,
                                createdAt: m.createdAt.toISOString(),
                            }))}
                        />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2">
                            <p className="text-black text-sm font-medium">No conversation selected</p>
                            <p className="text-black text-xs">Go to a property and click Message to start one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}