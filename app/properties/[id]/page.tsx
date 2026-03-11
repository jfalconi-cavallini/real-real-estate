import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await auth();

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            author: true,
            comments: {
                orderBy: { createdAt: "asc" },
                include: { author: true },
            },
        },
    });

    if (!property) notFound();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">

                {/* Property Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                    {property.imageUrl && (
                        <img
                            src={property.imageUrl}
                            alt={property.title}
                            style={{ width: "100%", height: "360px", objectFit: "cover", display: "block" }}
                        />
                    )}
                    <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-black">{property.title}</h1>
                                <p className="text-gray-600 mt-1">{property.address}</p>
                            </div>
                            {property.price && (
                                <span className="text-blue-600 font-bold text-2xl whitespace-nowrap">
                                    ${property.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="text-black mt-4 leading-relaxed">{property.description}</p>
                        <div className="mt-4 flex items-center justify-between text-sm text-black">
                            <span>
                                Posted by{" "}
                                <Link href={`/profile/${property.author.id}`} className="text-blue-600 hover:underline">
                                    {property.author.name ?? property.author.email}
                                </Link>
                            </span>
                            <span>{new Date(property.createdAt).toLocaleDateString()}</span>
                        </div>
                        {session?.user?.id && session.user.id !== property.authorId && (
                            <div className="mt-4">
                                <Link
                                    href={`/messages?to=${property.authorId}&name=${encodeURIComponent(property.author.name ?? property.author.email ?? "")}`}
                                    className="inline-block text-sm bg-gray-100 hover:bg-gray-200 text-blue-600 px-4 py-2 rounded-lg transition-colors"
                                >
                                    💬 Message {property.author.name ?? property.author.email}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-black mb-4">
                        {property.comments.length} {property.comments.length === 1 ? "Comment" : "Comments"}
                    </h2>

                    {session ? (
                        <form
                            action={async (formData: FormData) => {
                                "use server";
                                const body = formData.get("body") as string;
                                if (!body?.trim() || !session?.user?.id) return;
                                await prisma.comment.create({
                                    data: {
                                        body,
                                        authorId: session.user.id!,
                                        propertyId: property.id,
                                    },
                                });
                                const { revalidatePath } = await import("next/cache");
                                revalidatePath(`/properties/${property.id}`);
                            }}
                            className="mb-6"
                        >
                            <textarea
                                name="body"
                                rows={3}
                                required
                                placeholder="Write a comment..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <button
                                type="submit"
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Post Comment
                            </button>
                        </form>
                    ) : (
                        <p className="text-sm text-gray-600 mb-6">
                            <Link href="/auth/signin" className="text-blue-600 hover:underline">Sign in</Link> to leave a comment.
                        </p>
                    )}

                    <div className="space-y-4">
                        {property.comments.length === 0 && (
                            <p className="text-black text-sm">No comments yet. Start the discussion!</p>
                        )}
                        {property.comments.map((comment) => (
                            <div key={comment.id} className="border-t border-gray-100 pt-4">
                                <div className="flex items-center justify-between mb-1">
                                    <Link
                                        href={`/profile/${comment.author.id}`}
                                        className="text-sm font-medium text-blue-600 hover:underline"
                                    >
                                        {comment.author.name ?? comment.author.email}
                                    </Link>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-black">{comment.body}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}