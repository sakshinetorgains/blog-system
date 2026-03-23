"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { requestOtp, verifyOtp } from "@/lib/api";
import InterestsPicker from "@/app/components/subscribe/InterestsPicker";
import SourcePicker from "@/app/components/subscribe/SourcePicker";

const interestsList = ["Technology", "AI", "Marketing", "Finance", "Education"];

const sourceOptions = ["Blog", "Case Study", "White Paper", "Resource"] as const;

type FormType = {
  fullname: string;
  email: string;
  phone: string;
  organization: string;
  interests: string[];
  source: string;
  verified: boolean;
};

type Feedback = {
  type: "success" | "error";
  message: string;
};

export default function SubscribeModal({ source = "Blog" }: { source?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "otp" | "done">("form");

  const [form, setForm] = useState<FormType>({
    fullname: "",
    email: "",
    phone: "",
    organization: "",
    interests: [],
    source,
    verified: false,
  });

  const [otp, setOtp] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const [requestLoading, setRequestLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const interests = useMemo(() => interestsList, []);

  const remainingCooldownSeconds = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, Math.ceil((cooldownUntil - nowTick) / 1000));
  }, [cooldownUntil, nowTick]);

  useEffect(() => {
    if (!cooldownUntil) return;
    if (remainingCooldownSeconds <= 0) return;

    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, [cooldownUntil, remainingCooldownSeconds]);

  const resetModal = () => {
    setOpen(false);
    setStep("form");
    setOtp("");
    setFeedback(null);
    setRequestLoading(false);
    setVerifyLoading(false);
    setResendLoading(false);
    setCooldownUntil(null);
    setNowTick(Date.now());
    setForm({
      fullname: "",
      email: "",
      phone: "",
      organization: "",
      interests: [],
      source,
      verified: false,
    });
  };

  const handleInterestChange = (interest: string) => {
    setForm((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((i) => i !== interest) : [...prev.interests, interest],
      };
    });
  };

  const validateForm = () => {
    const fullname = form.fullname.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const organization = form.organization.trim();
    const interestsSelected = form.interests.length > 0;

    if (!fullname || !email || !phone || !organization || !interestsSelected) {
      setFeedback({ type: "error", message: "All fields are required" });
      return false;
    };

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) {
      setFeedback({ type: "error", message: "Invalid email address" });
      return false;
    }
    const phoneDigits = phone.replace(/[^\d]/g, "");
    const phoneOk = phoneDigits.length == 10;
    if (!phoneOk) {
      setFeedback({
        type: "error",
        message:
          "Phone number must be 10 digits. Use digits with +",
      });
      return false;
    }
    return true;
  };

  const handleApiError = (err: unknown) => {
    if (!axios.isAxiosError(err)) {
      setFeedback({ type: "error", message: "Something went wrong" });
      return;
    }

    const apiMessage =
      (err.response?.data?.error?.message as string | undefined) ||
      (err.response?.data?.error?.details?.[0]?.message as string | undefined) ||
      (err.response?.data?.error?.details?.message as string | undefined) ||
      (err.response?.data?.message as string | undefined) ||
      "Request failed";

    const retryAfterSeconds = err.response?.data?.retryAfterSeconds as
      | number
      | undefined;

    const attemptsRemaining = err.response?.data?.attemptsRemaining as
      | number
      | undefined;

    if (retryAfterSeconds) {
      setCooldownUntil(Date.now() + retryAfterSeconds * 1000);
    }

    if (apiMessage === "You have already subscribed") {
      setStep("done");
      setFeedback({ type: "success", message: apiMessage });
      return;
    }

    if (attemptsRemaining !== undefined && apiMessage === "Invalid OTP") {
      setFeedback({
        type: "error",
        message: `${apiMessage}. Attempts remaining: ${attemptsRemaining}`,
      });
      return;
    }
    setFeedback({ type: "error", message: apiMessage });
  };

  const requestOtpFlow = async ({ mode }: { mode: "request" | "resend" }) => {
    const setter = mode === "request" ? setRequestLoading : setResendLoading;
    setter(true);
    setFeedback(null);

    try {
      if (!validateForm()) return;
      const res = await requestOtp(form);
      const data = res.data;
      const errorMessage =
        (data?.error?.message as string | undefined) ??
        (data?.message as string | undefined);
      if (errorMessage === "You have already subscribed") {
        setStep("done");
        setFeedback({ type: "success", message: "You are already subscribed" });
        return;
      }
      setStep("otp");
      setOtp("");

      setFeedback({
        type: "success",
        message: data?.message ?? "OTP sent successfully",
      });

      const cooldownSeconds =
        data?.resendCooldownSeconds ??
        data?.retryAfterSeconds ??
        null;

      if (cooldownSeconds && typeof cooldownSeconds === "number") {
        setCooldownUntil(Date.now() + cooldownSeconds * 1000);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setter(false);
    }
  };

  const handleSubmit = async () => {
    await requestOtpFlow({ mode: "request" });
  };

  const handleVerify = async () => {
    setVerifyLoading(true);
    setFeedback(null);

    try {
      await verifyOtp({ ...form, otp });
      setStep("done");
      setFeedback({ type: "success", message: "Subscription successful!" });
    } catch (err) {
      handleApiError(err);
    } finally {
      setVerifyLoading(false);
    }
  };

  const canResend = remainingCooldownSeconds <= 0;

  return (

    <div>
      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white px-5 py-2 rounded-full hover:bg-blue-700 transition"
      >
        Subscribe
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={resetModal}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-xl relative max-h-[100vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={resetModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg"
            >
              ✖
            </button>

            {step === "form" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-1">
                  Subscribe
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Get latest blogs, insights & updates.
                </p>

                <div className="space-y-4">
                  <input
                    placeholder="Full Name"
                    className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.fullname}
                    onChange={(e) =>
                      setForm({ ...form, fullname: e.target.value })
                    }
                  />
                  <input
                    placeholder="Email"
                    className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                  <input
                    placeholder="Phone Number"
                    className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />

                  <input
                    placeholder="Organization"
                    className="w-full border border-gray-300 bg-white text-gray-900 placeholder-gray-400 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.organization}
                    onChange={(e) =>
                      setForm({ ...form, organization: e.target.value })
                    }
                  />

                  <div>
                    <p className="text-gray-700 font-medium mb-2">
                      Area of Interest
                    </p>
                    <InterestsPicker
                      items={interests}
                      selected={form.interests}
                      onToggle={handleInterestChange}
                    />
                  </div>

                  <div>
                    <p className="text-gray-700 font-medium mb-2">Source</p>
                    <SourcePicker
                      value={form.source}
                      options={sourceOptions}
                      onChange={(value) =>
                        setForm({ ...form, source: value })
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={requestLoading}
                  className="mt-3 w-full bg-blue-600 text-white py-3 rounded-full font-medium hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {requestLoading ? "Sending OTP..." : "Submit"}
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Verify OTP
                </h2>
                <input
                  placeholder="Enter OTP"
                  className="w-full border border-gray-300 bg-white text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={otp}
                  inputMode="numeric"
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                />

                <button
                  onClick={handleVerify}
                  disabled={verifyLoading}
                  className="mt-4 w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {verifyLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  onClick={() => requestOtpFlow({ mode: "resend" })}
                  disabled={!canResend || resendLoading}
                  className="mt-3 text-blue-600 text-sm"
                >
                  {resendLoading
                    ? "Resending..."
                    : canResend
                      ? "Resend OTP"
                      : `Resend in ${remainingCooldownSeconds}s`}
                </button>

                <p className="text-xs text-gray-500 mt-3">
                  Check backend console for OTP.
                </p>
              </>
            )}
            {step === "done" && (
              <div className="text-center py-6">
                <p
                  className={`font-semibold text-lg ${feedback?.type === "success"
                    ? "text-green-600"
                    : "text-red-500"
                    }`}
                >
                  {feedback?.message}
                </p>
              </div>
            )}
            {step !== "done" && feedback && (
              <p
                className={`mt-4 text-sm ${feedback.type === "success"
                  ? "text-green-600"
                  : "text-red-500"
                  }`}
              >
                {feedback.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );

}



