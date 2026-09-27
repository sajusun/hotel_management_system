import axios from "axios";

// Determine base URL dynamically (allow fallback to port 8000)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://backend_hms.test/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export interface RoomType {
  id: number;
  name: string;
  code: string;
  description: string;
  base_rate: number;
  capacity: number;
  amenities: string[] | string | null;
  images?: string[];
}

export interface Room {
  id: number;
  number: string;
  floor: number;
  room_type_id: number;
  status: string;
  room_type: RoomType;
}

export interface SearchParams {
  check_in_date: string;
  check_out_date: string;
  room_type_id?: number;
  guests_count?: number;
}

export interface ReservationPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  guests_count?: number;
  special_requests?: string;
}

export interface SupportPayload {
  customer_email: string;
  customer_name?: string;
  subject?: string;
  message: string;
}

export const api = {
  // Get all room types
  async getRoomTypes(): Promise<RoomType[]> {
    const response = await apiClient.get("/public/room-types");
    return response.data.data || response.data;
  },

  // Search availability
  async searchAvailability(params: SearchParams): Promise<Room[]> {
    const response = await apiClient.get("/public/availability", { params });
    return response.data.data || response.data;
  },

  // Create guest booking
  async createReservation(payload: ReservationPayload) {
    const response = await apiClient.post("/public/reservations", payload);
    return response.data.data || response.data;
  },

  // Create support ticket
  async createSupportTicket(payload: SupportPayload) {
    const response = await apiClient.post("/public/support/contact", payload);
    return response.data.data || response.data;
  },

  // Subscribe to newsletter (uses standard public route)
  async subscribeNewsletter(email: string) {
    const response = await apiClient.post("/newsletter/subscribe", { email });
    return response.data;
  },
};
