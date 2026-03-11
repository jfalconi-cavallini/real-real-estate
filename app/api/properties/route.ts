import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, address, imageUrl, description, price } = await req.json();

    if (!title || !address || !description) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const property = await prisma.property.create({
        data: {
            title,
            address,
            imageUrl,
            description,
            price,
            authorId: session.user.id,
        },
    });

    return NextResponse.json(property);
}