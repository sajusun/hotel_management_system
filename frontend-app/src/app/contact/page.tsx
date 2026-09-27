"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;

    setStatus("submitting");
    setErrorMsg("");

    try {
      await api.createSupportTicket({
        customer_name: name || undefined,
        customer_email: email,
        subject: subject || undefined,
        message: message,
      });

      setStatus("success");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setStatus("error");
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setErrorMsg(
        message || "Failed to submit ticket. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Header Banner */}
      <section className="relative py-20 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto space-y-4 z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Help & Support
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            Have questions about room amenities, custom itineraries, or event facilities? Drop us a message, and our help desk will get back to you shortly.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left/Middle: Ticket Submission Form */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Submit a Ticket</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Fill in the details below to start a conversation with our guest service team.
              </p>
            </div>

            {status === "success" && (
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400">
                <CheckCircle className="h-5.5 w-5.5 shrink-0 text-emerald-500 mt-0.5" />
                <div className="text-sm">
                  <span className="font-semibold block">Message sent successfully!</span>
                  <span>We have received your support request and assigned an assistant to review it.</span>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center space-x-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                <AlertCircle className="h-5.5 w-5.5 shrink-0" />
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    placeholder="E.g. Elena Rostova"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    placeholder="E.g. elena@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Subject (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Detailed Message
                </label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  placeholder="Provide details about your query here..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:opacity-95 disabled:opacity-55 transition-all duration-200"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 className="mr-2 h-4.5 w-4.5 animate-spin" />
                      Submitting support ticket...
                    </>
                  ) : (
                    <>
                      Submit Ticket
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Contact Information Cards */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-lg font-bold border-b border-zinc-100 dark:border-zinc-800 pb-2.5">
                Resort Contacts
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-sm">
                  <MapPin className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-900 dark:text-white">Location</span>
                    <span className="text-zinc-550 dark:text-zinc-400">
                      100 Ocean Crest Boulevard, Suite A, Coastal City, CC 90210
                    </span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <Phone className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-900 dark:text-white">Phone Reservations</span>
                    <span className="text-zinc-550 dark:text-zinc-400">+1 (555) 765-4321</span>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-sm">
                  <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-zinc-900 dark:text-white">General Email</span>
                    <span className="text-zinc-550 dark:text-zinc-400">contact@grandhorizon.com</span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                <h4 className="font-bold">Desk Hours</h4>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Our support desk is open 24/7 for active guests. General billing and non-reservation ticketing is reviewed daily from 8:00 AM to 6:00 PM EST.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
