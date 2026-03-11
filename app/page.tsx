import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: true, comments: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-black">Latest Properties</h1>
          <Link
            href="/properties/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Post Property
          </Link>
        </div>

        {properties.length === 0 && (
          <p className="text-black text-center py-20">
            No properties yet. Be the first to post one!
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.id}`}>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden cursor-pointer h-full">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    style={{ height: "200px", width: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div
                    className="w-full bg-gray-200 flex items-center justify-center text-black text-sm"
                    style={{ height: "200px" }}
                  >
                    No image
                  </div>
                )}
                <div className="p-4">
                  {property.price ? (
                    <p className="text-xl font-bold text-black mb-1">
                      ${property.price.toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-lg font-semibold text-gray-400 mb-1">Price not listed</p>
                  )}
                  <h2 className="text-sm font-semibold text-black truncate">{property.title}</h2>
                  <p className="text-sm text-gray-600 truncate mt-0.5">{property.address}</p>
                  <p className="text-sm text-black mt-2 line-clamp-2">{property.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-black">
                      by {property.author.name ?? property.author.email}
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