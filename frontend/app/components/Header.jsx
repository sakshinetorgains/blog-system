"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
                    MyBlogs
                </Link>
                <button
                    className="md:hidden text-2xl"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </button>
            </div>
            {menuOpen && (
                <div className="md:hidden px-6 pb-4 space-y-4 bg-white border-t">
                    <Link href="/" className="block text-gray-700 hover:text-blue-600">
                        Blogs
                    </Link>
                </div>
            )}
        </header>
    );
}