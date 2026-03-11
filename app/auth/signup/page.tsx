"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const form = e.currentTarget;
        const name = (form.elements.namedItem("name") as HTMLInputElement).value;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Something went wrong");
            setLoading(false);
            return;
        }

        router.push("/auth/signin");
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-black">Create your account</h1>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-black">Name</label>
                        <input name="name" type="text" required className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-black">Email</label>
                        <input name="email" type="email" required className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-black">Password</label>
                        <input name="password" type="password" required minLength={6} className="w-full border rounded-lg px-3 py-2 text-sm text-black" />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}