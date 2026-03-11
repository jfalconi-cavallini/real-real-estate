import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiverId, body } = await req.json();

    if (!receiverId || !body?.trim()) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const message = await prisma.message.create({
        data: {
            body,
            senderId: session.user.id,
            receiverId,
        },
    });

    return NextResponse.json(message);
}