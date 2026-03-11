import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Navbar() {
    const session = await auth();

    return (
        <nav className="bg-white border-b px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link href="/" className="text-xl font-bold text-blue-600">
                    Real Real Estate
                </Link>
                <div className="flex items-center gap-4 text-sm">
                    {session ? (
                        <>
                            <Link href="/properties/new" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                                + Post Property
                            </Link>
                            <Link href={`/profile/${session.user.id}`} className="text-gray-600 hover:text-black">
                                {session.user.name ?? session.user.email}
                            </Link>
                            <Link href="/messages" className="text-gray-600 hover:text-black">
                                Messages
                            </Link>
                            <form action={async () => {
                                "use server";
                                await signOut({ redirectTo: "/" });
                            }}>
                                <button type="submit" className="text-gray-600 hover:text-black">
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin" className="text-gray-600 hover:text-black">Sign In</Link>
                            <Link href="/auth/signup" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}