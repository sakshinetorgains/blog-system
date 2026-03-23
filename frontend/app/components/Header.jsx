"use client";
import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

                {/* Logo */}
                <h1 className="text-2xl font-bold text-blue-600">
                    <Link href="/" className="text-gray-700 hover:text-blue-600">
                        My Blog
                    </Link>
                </h1>

                {/* Navigation */}
                <nav className="space-x-6 hidden md:block">
                    {/* <Link href="/" className="text-gray-700 hover:text-blue-600">
                        Home
                    </Link> */}

                </nav>

                {/* Button */}
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Subscribe
                </button>
            </div>
        </header>
    );
}