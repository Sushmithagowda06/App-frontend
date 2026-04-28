/**
 * Liqway Medical – Centralized API Service (Axios)
 */

import axios, { AxiosError } from "axios";

// ─── Axios instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://192.168.29.144:8000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request interceptor ─────────────────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    // TODO: attach auth token here when you add login
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string; message?: string }>) => {
    let message: string;
    if (error.response) {
      const data = error.response.data;
      message =
        data?.detail ??
        data?.message ??
        error.response.statusText ??
        `Server error ${error.response.status}`;
    } else if (error.request) {
      message =
        "No response from server – check your IP address and make sure the backend is running.";
    } else {
      message = error.message ?? "Unexpected error";
    }
    return Promise.reject(new Error(message));
  }
);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  fee: number;
  photo?: string;
  resumeImage?: string;
  certificateImage?: string;
  about?: string;
  experience: {
    years: number;
    months?: number;
  };
}

export type SlotStatus = "available" | "limited" | "unavailable";
export type SlotGroup = "Morning" | "Afternoon" | "Evening";

export type Slot = {
  id: string;
  time: string;
  status: SlotStatus;
  group: SlotGroup;
};

export interface Patient {
  id:     number;
  name:   string;
  age:    number;
  gender: string;
}

export interface ApiDocument {
  id:        number;
  file_name: string;
  file_url:  string;
}

export interface Prescription {
  id:          number;
  patient_id:  number;
  doctor_id:   number;
  date:        string;
  title:       "Prescription" | "Report";
  detail:      string;
  doctor_name: string;
  documents:   ApiDocument[];
}

// ─── Doctor routes ───────────────────────────────────────────────────────────

export const doctorApi = {
  /** GET /api/v1/doctors */
  getAll: async (): Promise<Doctor[]> => {
    const { data } = await api.get<Doctor[]>("/doctors");
    return data;
  },

  /** GET /api/v1/doctors/:id */
  getById: async (id: string): Promise<Doctor> => {
    const { data } = await api.get<Doctor>(`/doctors/${id}`);
    return data;
  },

  /** GET /api/v1/doctors – filtered by specialization client-side */
  getBySpecialization: async (specialization: string): Promise<Doctor[]> => {
    const { data } = await api.get<Doctor[]>("/doctors");
    return data.filter((d) => d.specialty === specialization);
  },

  /** GET /api/v1/doctors/:id/slots?from=YYYY-MM-DD&days=7 */
  getSlots: async (
    doctorId: string,
    from?: string,
    days?: number
  ): Promise<Record<string, Slot[]>> => {
    const { data } = await api.get<Record<string, Slot[]>>(`/doctors/${doctorId}/slots`, {
      params: { from, days },
    });
    return data;
  },
};

// ─── Patient routes ──────────────────────────────────────────────────────────

export const patientApi = {
  getAll: async (): Promise<Patient[]> => {
    const { data } = await api.get<Patient[]>("/patients");
    return data;
  },
  getById: async (id: number): Promise<Patient> => {
    const { data } = await api.get<Patient>(`/patients/${id}`);
    return data;
  },
};

// ─── Prescription routes ─────────────────────────────────────────────────────

export const prescriptionApi = {
  getAll: async (): Promise<Prescription[]> => {
    const { data } = await api.get<Prescription[]>("/prescriptions");
    return data;
  },
  getByPatient: async (patientId: number): Promise<Prescription[]> => {
    const { data } = await api.get<Prescription[]>(
      `/prescriptions/patient/${patientId}`
    );
    return data;
  },
};

// ─── Document routes ─────────────────────────────────────────────────────────

export const documentApi = {
  getByPrescription: async (prescriptionId: number): Promise<ApiDocument[]> => {
    const { data } = await api.get<ApiDocument[]>(
      `/documents/prescription/${prescriptionId}`
    );
    return data;
  },
};