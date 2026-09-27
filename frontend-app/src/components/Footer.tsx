"use client";

import Link from "next/link";
import { Hotel, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("submitting");
    try {
      await api.subscribeNewsletter(email);
      setStatus("success");
      setEmail("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setErrorMessage(
        message || "Failed to subscribe. Please try again."
      );
    }
  };

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                <Hotel className="h-5 w-5" />
              </div>
              <span className="font-sans text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-white dark:to-zinc-300">
                Grand Horizon
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Experience absolute luxury and tranquil coastal living at the heart of our premium resort. Our dedication is your ultimate comfort.
            </p>
            <div className="flex space-x-4 pt-2">
              {/* Social icons placeholders */}
              <span className="h-8 w-8 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">FB</span>
              <span className="h-8 w-8 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">IG</span>
              <span className="h-8 w-8 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 flex items-center justify-center text-xs text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">TW</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/rooms" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                  Rooms & Suites
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                  Check Availability
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                  Help & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              Contact Info
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  100 Ocean Crest Boulevard, Suite A, Coastal City, CC 90210
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  +1 (555) 765-4321
                </span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-zinc-400 shrink-0" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  contact@grandhorizon.com
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3.5 leading-snug">
              Subscribe to unlock seasonal offers and priority bookings.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex flex-col space-y-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  disabled={status === "submitting" || status === "success"}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={status === "submitting" || status === "success"}
                  className="absolute right-1 top-1 bottom-1 flex items-center justify-center rounded-lg bg-indigo-600 px-2.5 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>

              {status === "success" && (
                <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 text-xs mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Subscribed successfully!</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center space-x-1.5 text-rose-600 dark:text-rose-400 text-xs mt-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{errorMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6 text-center">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} Grand Horizon Hotel & Suites. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
