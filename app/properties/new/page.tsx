"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NewPropertyPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
        );

        const data = await res.json();
        setImageUrl(data.secure_url);
        setUploading(false);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = e.currentTarget;
        const title = (form.elements.namedItem("title") as HTMLInputElement).value;
        const address = (form.elements.namedItem("address") as HTMLInputElement).value;
        const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
        const price = (form.elements.namedItem("price") as HTMLInputElement).value;

        const res = await fetch("/api/properties", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title,
                address,
                imageUrl,
                description,
                price: price ? parseFloat(price) : null,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Something went wrong");
            setLoading(false);
            return;
        }

        router.push(`/properties/${data.id}`);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
                <h1 className="text-2xl font-bold mb-6 text-black">Post a Property</h1>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Title</label>
                        <input
                            name="title"
                            type="text"
                            required
                            placeholder="e.g. Cozy 2BR in Austin"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Address</label>
                        <input
                            name="address"
                            type="text"
                            required
                            placeholder="e.g. 123 Main St, Austin TX"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Property Image</label>
                        <div className="border border-gray-300 rounded-lg p-4 flex flex-col items-center gap-3 bg-gray-50">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Property preview" className="w-full h-48 object-cover rounded-lg" />
                            ) : (
                                <div className="w-full h-48 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                    No image uploaded yet
                                </div>
                            )}
                            <label className="cursor-pointer bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                {uploading ? "Uploading..." : imageUrl ? "Change Image" : "Upload Image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Description</label>
                        <textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="Describe the property..."
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium text-black">Price (optional)</label>
                        <input
                            name="price"
                            type="number"
                            min="0"
                            placeholder="e.g. 450000"
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? "Posting..." : "Post Property"}
                    </button>
                </form>
            </div>
        </div>
    );
}