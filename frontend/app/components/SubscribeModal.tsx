


"use client";
import { useState } from "react";
import { sendOTP, subscribeUser } from "@/lib/api";
import { verifyOTP } from "@/lib/api";
import axios from "axios";
const interestsList = [
    "Technology",
    "AI",
    "Marketing",
    "Finance",
    "Education",
];
type FormType = {
    fullname: string;
    email: string;
    phone: string;
    organization: string;
    interests: string[];
    source: string;
    verified: boolean;
};

export default function SubscribeModal({ source = "Blog" }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState("form");

    const [form, setForm] = useState<FormType>({
        fullname: "",
        email: "",
        phone: "",
        organization: "",
        interests: [],
        source: source,
        verified: false,
    });

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const handleInterestChange = (interest: string) => {
        setForm((prev) => {
            const exists = prev.interests.includes(interest);
            return {
                ...prev,
                interests: exists
                    ? prev.interests.filter((i) => i !== interest)
                    : [...prev.interests, interest],
            };
        });
    };

    const handleSubmit = async () => {
        try {
            // await subscribeUser(form);
            await sendOTP(form);
            console.log("form==>", form)
            setStep("otp");
            setMessage("OTP sent to your email!");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.error?.message;
                console.log(msg);
                setMessage(msg || "Error submitting form");
            } else {
                setMessage("Something went wrong");
            }
        }
    }

    const handleVerify = async () => {
        try {
            await verifyOTP({
                ...form,
                otp,
            });
            setStep("done");
            setMessage("Subscription successful!");
        } catch {
            setMessage("Invalid OTP");
        }
    };

    const handleClose = () => {
        console.log("button is clicked")
        setOpen(false);
        setStep("form");
        setOtp("");
        setMessage("");

        setForm({
            fullname: "",
            email: "",
            phone: "",
            organization: "",
            interests: [],
            source: source,
            verified: false,
        });
    };

    return (
        <div>

            <button
                onClick={() => setOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
            >
                Subscribe
            </button>


            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

                    <div
                        className="bg-black p-6 rounded w-[700px] max-h-[90vh] overflow-y-auto relative"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2"
                        >
                            ✖
                        </button>

                        {step === "form" && (
                            <>
                                <h2 className="text-xl mb-4 font-bold">Subscribe</h2>

                                <input
                                    placeholder="Full Name"
                                    className="border p-2 w-full mb-2"
                                    onChange={(e) =>
                                        setForm({ ...form, fullname: e.target.value })
                                    }
                                />
                                <input
                                    placeholder="Email"
                                    className="border p-2 w-full mb-2"
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                />
                                <input
                                    placeholder="Phone Number"
                                    className="border p-2 w-full mb-2"
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                />

                                <input
                                    placeholder="Organization"
                                    className="border p-2 w-full mb-4"
                                    onChange={(e) =>
                                        setForm({ ...form, organization: e.target.value })
                                    }
                                />

                                <p className="mb-2 font-semibold">Area of Interest</p>
                                <div className="mb-4">
                                    {interestsList.map((item) => (
                                        <label key={item} className="block">
                                            <input
                                                type="checkbox"
                                                checked={form.interests.includes(item)}
                                                onChange={() => handleInterestChange(item)}
                                            />
                                            <span className="ml-2">{item}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* SOURCE */}
                                <p className="mb-2 font-semibold">Source</p>
                                <select
                                    className="border p-2 w-full mb-4 bg-blue-100 text-black"
                                    value={form.source}
                                    onChange={(e) =>
                                        setForm({ ...form, source: e.target.value })
                                    }
                                >
                                    <option value="Blog" className="text-dark">Blog</option>
                                    <option value="Case Study">Case Study</option>
                                    <option value="White Paper">White Paper</option>
                                    <option value="Resource">Resource</option>
                                </select>

                                <button
                                    onClick={handleSubmit}
                                    className="bg-green-600 text-white w-full py-2"
                                >
                                    Submit
                                </button>
                            </>
                        )}

                        {step === "otp" && (
                            <>
                                <h2 className="text-lg mb-2">Enter OTP</h2>

                                <input
                                    placeholder="Enter OTP"
                                    className="border p-2 w-full mb-3"
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <button
                                    onClick={handleVerify}
                                    className="bg-blue-600 text-white w-full py-2"
                                >
                                    Verify OTP
                                </button>
                            </>
                        )}

                        {step === "done" && (
                            <p className="text-green-600 font-semibold">{message}</p>
                        )}

                        <p className="text-red-500 mt-2">{message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}