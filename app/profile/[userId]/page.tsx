import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const session = await auth();

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            properties: {
                orderBy: { createdAt: "desc" },
                include: { comments: true },
            },
        },
    });

    if (!user) notFound();

    const isOwnProfile = session?.user?.id === userId;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">

                {/* Profile Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                    <h1 className="text-2xl font-bold text-black">{user.name ?? user.email}</h1>
                    <p className="text-black text-sm mt-1">{user.email}</p>
                    <p className="text-black text-sm mt-1">
                        {user.properties.length} {user.properties.length === 1 ? "property" : "properties"} posted
                    </p>
                    {!isOwnProfile && session && (
                        <div className="mt-4">
                            <Link
                                href={`/messages?to=${user.id}&name=${encodeURIComponent(user.name ?? user.email ?? "")}`}
                                className="inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                💬 Message {user.name ?? user.email}
                            </Link>
                        </div>
                    )}
                </div>

                {/* Properties */}
                <h2 className="text-lg font-bold text-black mb-4">
                    {isOwnProfile ? "Your Listings" : `${user.name ?? user.email}'s Listings`}
                </h2>

                {user.properties.length === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                        <p className="text-black text-sm">No properties posted yet.</p>
                        {isOwnProfile && (
                            <Link
                                href="/properties/new"
                                className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                                + Post Your First Property
                            </Link>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {user.properties.map((property) => (
                        <Link key={property.id} href={`/properties/${property.id}`}>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                                {property.imageUrl ? (
                                    <img
                                        src={property.imageUrl}
                                        alt={property.title}
                                        style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                                    />
                                ) : (
                                    <div
                                        className="w-full bg-gray-200 flex items-center justify-center text-black text-sm"
                                        style={{ height: "180px" }}
                                    >
                                        No image
                                    </div>
                                )}
                                <div className="p-4">
                                    {property.price ? (
                                        <p className="text-lg font-bold text-black mb-1">
                                            ${property.price.toLocaleString()}
                                        </p>
                                    ) : (
                                        <p className="text-sm font-semibold text-black mb-1">Price not listed</p>
                                    )}
                                    <h3 className="text-sm font-semibold text-black truncate">{property.title}</h3>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-xs text-black">
                                            {new Date(property.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="text-xs text-black">
                                            💬 {property.comments.length} comments
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </div>
        </div>
    );
}