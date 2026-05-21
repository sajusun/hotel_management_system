"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BedDouble, Users, Check, ArrowRight, Loader2 } from "lucide-react";
import { api, RoomType } from "@/lib/api";

export default function RoomsPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRooms() {
      try {
        const data = await api.getRoomTypes();
        setRoomTypes(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load room accommodations. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadRooms();
  }, []);

  // Helper to parse amenities (stored as JSON array or comma separated string)
  const parseAmenities = (amenitiesData: string[] | string | null | undefined): string[] => {
    if (!amenitiesData) return ["High-Speed Wi-Fi", "Smart TV", "Air Conditioning"];
    if (Array.isArray(amenitiesData)) return amenitiesData;
    if (typeof amenitiesData === "string") {
      try {
        const parsed = JSON.parse(amenitiesData);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return amenitiesData.split(",").map((s) => s.trim());
      }
    }
    return ["High-Speed Wi-Fi", "Smart TV", "Air Conditioning"];
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Banner */}
      <section className="relative py-20 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black text-white px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto space-y-4 z-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
            Our Accommodations
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 leading-relaxed">
            Discover a world of refined elegance. Browse our selection of bespoke rooms, executive suites, and ocean-facing villas designed for absolute serenity.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-zinc-500">Curating room selection...</span>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto text-center p-8 rounded-2xl border border-rose-200/50 bg-rose-50/50 dark:border-rose-900/30 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400">
            <p className="font-semibold">{error}</p>
          </div>
        ) : roomTypes.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-2xl dark:border-zinc-800">
            <p className="text-zinc-500 dark:text-zinc-400">No rooms listed in our system yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {roomTypes.map((type) => {
              const amenities = parseAmenities(type.amenities);
              return (
                <div
                  key={type.id}
                  className="flex flex-col md:flex-row overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-sm hover:shadow-lg dark:border-zinc-800/80 dark:bg-zinc-900 transition-all duration-300 group"
                >
                  {/* Left: Image Placeholder Banner */}
                  <div className="relative md:w-2/5 min-h-[220px] bg-gradient-to-br from-indigo-950 to-zinc-950 flex flex-col justify-between p-6 text-white shrink-0">
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300" />
                    <BedDouble className="h-12 w-12 text-white/40 z-10" />

                    <div className="z-10 mt-auto space-y-2">
                      <div className="inline-flex items-center space-x-1 rounded-md bg-white/10 px-2 py-0.5 text-xs font-semibold backdrop-blur-md">
                        <Users className="h-3 w-3 mr-1" />
                        <span>Max {type.capacity} Guests</span>
                      </div>
                      <span className="block text-xs text-zinc-400 uppercase tracking-widest font-mono">
                        Ref: {type.code}
                      </span>
                    </div>
                  </div>

                  {/* Right: Room Type Details */}
                  <div className="flex flex-col p-6 flex-grow justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-950 dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {type.name}
                      </h2>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4 line-clamp-3">
                        {type.description}
                      </p>

                      {/* Amenities List */}
                      <div className="mb-6">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5">
                          Highlights & Amenities
                        </h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {amenities.slice(0, 4).map((amenity, index) => (
                            <div key={index} className="flex items-center text-xs text-zinc-600 dark:text-zinc-300">
                              <Check className="h-3.5 w-3.5 text-emerald-500 mr-1.5 shrink-0" />
                              <span className="truncate">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Rates & Actions */}
                    <div className="flex items-center justify-between pt-5 border-t border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider block font-medium">From</span>
                        <div className="flex items-baseline">
                          <span className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                            ${Number(type.base_rate).toFixed(0)}
                          </span>
                          <span className="text-xs text-zinc-500 ml-1">/ night</span>
                        </div>
                      </div>

                      <Link
                        href={`/booking?room_type_id=${type.id}`}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all duration-200"
                      >
                        Book Now
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
