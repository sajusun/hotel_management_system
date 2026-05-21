"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bed, Star, Shield, Award, Compass, Heart } from "lucide-react";
import { api, RoomType } from "@/lib/api";

export default function HomePage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const types = await api.getRoomTypes();
        setRoomTypes(types.slice(0, 3)); // show top 3 room types
      } catch (err) {
        console.error("Failed to load room types:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const features = [
    {
      title: "Oceanfront Vistas",
      desc: "Wake up to endless blue horizons and refreshing ocean breezes from your private terrace.",
      icon: Compass,
    },
    {
      title: "Michelin Gastronomy",
      desc: "Savor exquisite dishes prepared by internationally acclaimed culinary experts.",
      icon: Award,
    },
    {
      title: "Bespoke Concierge",
      desc: "From yacht charters to private tours, our concierge shapes unforgettable experiences.",
      icon: Shield,
    },
    {
      title: "Tranquil Wellness Spa",
      desc: "Rejuvenate your body and soul with personalized therapeutic treatments and rituals.",
      icon: Heart,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[92vh] bg-[url('/hero.png')] bg-cover bg-center text-white px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Advanced Multi-layer Gradient Overlay for maximum focus and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-black/60 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(9,9,11,0.65)_90%)] z-0" />

        {/* Decorative ambient sunset light flares */}
        <div className="absolute top-1/3 left-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl z-0" />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 rounded-full bg-violet-600/10 blur-3xl z-0" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10 py-16 md:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-300 border border-amber-500/20 uppercase tracking-widest backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Welcome to Paradise
          </span>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15] max-w-4xl mx-auto">
            A Haven of <span className="bg-gradient-to-r from-amber-200 via-amber-100 to-orange-200 bg-clip-text text-transparent">Exquisite Luxury</span> and Peace
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-zinc-200/90 leading-relaxed font-normal">
            Escape to Grand Horizon. Immerse yourself in premium seaside suites, Michelin-star dining, and bespoke service designed around your every desire.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <Link
              href="/booking"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-4 text-base font-bold text-zinc-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Reserve Your Stay
              <ArrowRight className="ml-2.5 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/rooms"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur-md hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Explore Our Rooms
            </Link>
          </div>
        </div>

        {/* Floating Quick Stats/Characteristics Strip */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-950 to-transparent pt-16 pb-8 z-10 hidden sm:block">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-4 gap-6 text-center border-t border-white/10 pt-8 backdrop-blur-[1px]">
              <div>
                <p className="text-2xl lg:text-3xl font-extrabold text-amber-200">5-Star</p>
                <p className="text-[10px] lg:text-xs text-zinc-400 uppercase tracking-widest mt-1">Luxury Rating</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-extrabold text-white">120+</p>
                <p className="text-[10px] lg:text-xs text-zinc-400 uppercase tracking-widest mt-1">Seaside Suites</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-extrabold text-white">3</p>
                <p className="text-[10px] lg:text-xs text-zinc-400 uppercase tracking-widest mt-1">Michelin Stars</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-extrabold text-white">24/7</p>
                <p className="text-[10px] lg:text-xs text-zinc-400 uppercase tracking-widest mt-1">Bespoke Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Characteristics Section */}
      <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              The Grand Horizon Experience
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Indulge in meticulously curated amenities and unmatched hospitality that define our retreat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="relative flex flex-col p-6 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:border-zinc-200 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-900/30 dark:hover:border-zinc-800 dark:hover:bg-zinc-900/60 transition-all duration-300 hover:shadow-md group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500/10 to-violet-500/10 text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-105 transition-transform duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/30 border-y border-zinc-200/50 dark:border-zinc-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div className="space-y-2.5">
              <h2 className="text-3xl font-bold tracking-tight">
                Our Signature Accommodations
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xl">
                Impeccably appointed guest rooms, suites, and private villas featuring state-of-the-art details.
              </p>
            </div>
            <Link
              href="/rooms"
              className="group inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:opacity-90 mt-4 sm:mt-0"
            >
              View all rooms
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-2xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
              <p className="text-zinc-500">No rooms listed at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {roomTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-md hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-300 group"
                >
                  <div className="relative h-60 bg-gradient-to-br from-indigo-900 to-zinc-900 flex items-center justify-center text-white p-6">
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                    <Bed className="h-16 w-16 text-white/40 z-10 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="inline-flex items-center rounded-md bg-white/10 px-2 py-1 text-xs font-semibold text-white backdrop-blur-md">
                        Capacity: {type.capacity} Guests
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col p-6 flex-grow justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                        {type.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider block">nightly rate</span>
                        <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                          ${Number(type.base_rate).toFixed(0)}
                        </span>
                      </div>
                      <Link
                        href={`/booking?room_type_id=${type.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Voices of Satisfaction</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Read about the memorable experiences shared by guests who stayed at our resort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "An absolute masterclass in luxury hospitality. The ocean vistas were breathtaking, and the Michelin dining exceeded every expectation.",
                author: "Helena Rostova",
                title: "Executive Director",
                rating: 5,
              },
              {
                quote: "The booking process was seamless, and the concierge was incredibly attentive. We enjoyed private yachts and custom spa sessions.",
                author: "Julian Mercer",
                title: "Private Investor",
                rating: 5,
              },
              {
                quote: "Quiet, refined, and beautifully situated. Grand Horizon has officially become our family's annual retreat location.",
                author: "Sarah & David K.",
                title: "Family Vacationers",
                rating: 5,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between p-8 rounded-2xl border border-zinc-100 bg-zinc-50/50 dark:border-zinc-900 dark:bg-zinc-900/30 leading-relaxed shadow-sm"
              >
                <div className="space-y-4">
                  <div className="flex space-x-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/80 mt-6 flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {t.author.substring(0, 1)}
                  </div>
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-white block text-sm">
                      {t.author}
                    </span>
                    <span className="text-xs text-zinc-400 block">{t.title}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
