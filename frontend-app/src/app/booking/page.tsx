"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { api, Room, RoomType } from "@/lib/api";
import {
  Calendar,
  Users,
  Bed,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2,
  CalendarCheck2,
  AlertCircle,
  Info,
} from "lucide-react";

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Step state: 1 = Search, 2 = Select Room, 3 = Guest Details, 4 = Success
  const [step, setStep] = useState(1);

  // Lists from API
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // Search parameters
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [selectedRoomType, setSelectedRoomType] = useState<string>("");
  const [guestsCount, setGuestsCount] = useState<number>(1);

  // Selected Room
  const [chosenRoom, setChosenRoom] = useState<Room | null>(null);

  // Guest details form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [submitError, setSubmitError] = useState("");

  // Success details
  const [reservationResult, setReservationResult] = useState<any>(null);

  // Load room types and handle initial query parameters
  useEffect(() => {
    async function loadRoomTypes() {
      try {
        const types = await api.getRoomTypes();
        setRoomTypes(types);

        // Pre-select room type from URL query if present
        const typeIdParam = searchParams.get("room_type_id");
        if (typeIdParam) {
          setSelectedRoomType(typeIdParam);
        }
      } catch (err) {
        console.error("Failed to load room types:", err);
      }
    }
    loadRoomTypes();

    // Default dates (today & tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    setCheckIn(today.toISOString().split("T")[0]);
    setCheckOut(tomorrow.toISOString().split("T")[0]);
  }, [searchParams]);

  // Step 1: Search availability
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setLoading(true);

    if (new Date(checkOut) <= new Date(checkIn)) {
      setSearchError("Check-out date must be after check-in date.");
      setLoading(false);
      return;
    }

    try {
      const rooms = await api.searchAvailability({
        check_in_date: checkIn,
        check_out_date: checkOut,
        room_type_id: selectedRoomType ? Number(selectedRoomType) : undefined,
        guests_count: guestsCount,
      });

      setAvailableRooms(rooms);
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setSearchError(
        err.response?.data?.message || "Failed to search availability. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Choose room
  const handleSelectRoom = (room: Room) => {
    setChosenRoom(room);
    setStep(3);
  };

  // Step 3: Complete Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chosenRoom) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const result = await api.createReservation({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
        room_id: chosenRoom.id,
        check_in_date: checkIn,
        check_out_date: checkOut,
        guests_count: guestsCount,
        special_requests: specialRequests,
      });

      setReservationResult(result);
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setSubmitError(
        err.response?.data?.message || "Failed to create reservation. Please verify details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Calculated nights count
  const getNightsCount = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Steps indicator renderer
  const renderStepsIndicator = () => {
    const steps = ["1. Search", "2. Select Room", "3. Guest Details", "4. Confirmed"];
    return (
      <div className="flex items-center justify-between w-full max-w-lg mx-auto mb-10 text-xs sm:text-sm font-semibold text-zinc-400">
        {steps.map((s, idx) => {
          const num = idx + 1;
          const isDone = step > num;
          const isCurrent = step === num;
          return (
            <div key={idx} className="flex items-center space-x-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-all duration-300 ${
                  isDone
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : isCurrent
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 ring-2 ring-indigo-500/10"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-400"
                }`}
              >
                {isDone ? "✓" : num}
              </span>
              <span className={isCurrent ? "text-indigo-600 dark:text-indigo-400 font-bold" : isDone ? "text-zinc-600 dark:text-zinc-300" : ""}>
                {s.split(". ")[1]}
              </span>
              {idx < steps.length - 1 && <span className="text-zinc-300 dark:text-zinc-800">/</span>}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {renderStepsIndicator()}

        {/* Step 1: Search Form */}
        {step === 1 && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/80 p-8 shadow-sm">
            <div className="mb-6 space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Check Availability</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Specify your dates and preferences to retrieve available rooms.
              </p>
            </div>

            {searchError && (
              <div className="mb-6 flex items-center space-x-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm">{searchError}</span>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Check-In Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Check-Out Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                      type="date"
                      required
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Room Type (Optional)
                  </label>
                  <div className="relative">
                    <Bed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <select
                      value={selectedRoomType}
                      onChange={(e) => setSelectedRoomType(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white appearance-none"
                    >
                      <option value="">All Room Types</option>
                      {roomTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} (${Number(type.base_rate).toFixed(0)}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Guests Count
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:opacity-95 transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                      Searching available rooms...
                    </>
                  ) : (
                    <>
                      Check Availability
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Change Dates
              </button>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
                {availableRooms.length} Available Rooms
              </span>
            </div>

            {availableRooms.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-1">No Rooms Available</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                  There are no rooms matching your search parameters for the selected dates.
                </p>
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                >
                  Modify Dates
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex flex-col justify-between p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-sm hover:border-zinc-300 hover:shadow-md transition-all duration-300"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {room.room_type?.name || "Suite"}
                          </span>
                          <h3 className="text-xl font-extrabold text-zinc-950 dark:text-white mt-1">
                            Room {room.number}
                          </h3>
                        </div>
                        <span className="inline-flex items-center space-x-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold">
                          <Layers className="h-3 w-3 mr-1 text-zinc-400" />
                          <span>Floor {room.floor}</span>
                        </span>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-3 leading-relaxed">
                        {room.room_type?.description || "A gorgeous, well-appointed guest room with modern amenities."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-850">
                      <div>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider block">Estimated rate</span>
                        <div className="flex items-baseline">
                          <span className="text-xl font-extrabold text-zinc-900 dark:text-white">
                            ${Number(room.room_type?.base_rate || 100).toFixed(0)}
                          </span>
                          <span className="text-xs text-zinc-500 ml-1">/ night</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectRoom(room)}
                        className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 transition-colors"
                      >
                        Select Room
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Checkout Details */}
        {step === 3 && chosenRoom && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Guest Details Form */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Guest Information</h2>
                <button
                  onClick={() => setStep(2)}
                  className="inline-flex items-center text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back
                </button>
              </div>

              {submitError && (
                <div className="mb-6 flex items-center space-x-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-sm">{submitError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="E.g. airport pickup, baby cot, dietary requirements..."
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3.5 text-base font-semibold text-white shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:opacity-95 transition-all duration-200"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                        Processing reservation...
                      </>
                    ) : (
                      <>
                        Confirm Reservation
                        <CheckCircle className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Booking Summary Card */}
            <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between h-fit space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-bold border-b border-zinc-800 pb-3">Booking Summary</h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Selected Room</span>
                    <span className="font-semibold text-white">Room {chosenRoom.number}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Room Type</span>
                    <span className="font-semibold text-white truncate max-w-[150px]">
                      {chosenRoom.room_type?.name}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Floor</span>
                    <span className="font-semibold text-white">Floor {chosenRoom.floor}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Check-In</span>
                    <span className="font-semibold text-white">{checkIn}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Check-Out</span>
                    <span className="font-semibold text-white">{checkOut}</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Nights Count</span>
                    <span className="font-semibold text-white">{getNightsCount()} nights</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Guests</span>
                    <span className="font-semibold text-white">{guestsCount} guests</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-850">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-semibold text-zinc-400">Total Price</span>
                  <span className="text-2xl font-extrabold text-white">
                    ${Number((chosenRoom.room_type?.base_rate || 100) * getNightsCount()).toFixed(2)}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-snug">
                  Includes base rates and VAT. Special request modifications may incur extra service charges check-in.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Success confirmation */}
        {step === 4 && reservationResult && (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 p-8 shadow-sm text-center max-w-2xl mx-auto space-y-6 py-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 ring-4 ring-emerald-500/10">
              <CalendarCheck2 className="h-7 w-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tight">Booking Confirmed!</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Thank you for choosing Grand Horizon. Your reservation has been successfully booked.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl p-6 text-left border border-zinc-100 dark:border-zinc-900 space-y-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400 font-medium">Reservation Code:</span>
                <span className="font-extrabold text-zinc-900 dark:text-white uppercase">
                  {reservationResult.reference || "RES-CODE"}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-100 dark:border-zinc-900 pt-3.5">
                <span className="text-zinc-400 font-medium">Room Assigned:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Room {chosenRoom?.number} (Floor {chosenRoom?.floor})
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-100 dark:border-zinc-900 pt-3.5">
                <span className="text-zinc-400 font-medium">Check-In:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{checkIn}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-zinc-100 dark:border-zinc-900 pt-3.5">
                <span className="text-zinc-400 font-medium">Check-Out:</span>
                <span className="font-semibold text-zinc-900 dark:text-white">{checkOut}</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              A confirmation email containing checking details and resort rules has been sent to{" "}
              <span className="font-semibold text-zinc-600 dark:text-zinc-300">{email}</span>.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => {
                  setStep(1);
                  setChosenRoom(null);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setSpecialRequests("");
                  setReservationResult(null);
                  router.push("/");
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-900 px-6 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Return to Home
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setChosenRoom(null);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPhone("");
                  setSpecialRequests("");
                  setReservationResult(null);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 dark:text-zinc-100 px-6 py-2.5 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Make Another Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <span className="text-sm font-medium text-zinc-500">Loading booking setup...</span>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
