import axios, { AxiosError } from "axios";

/**
 * Central API Service
 */

// ─── Axios instance ─────────────────────────────────────────

const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    "http://localhost:8000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Interceptors ──────────────────────────────────────────

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
        "No response from server – check your backend or IP.";
    } else {
      message = error.message ?? "Unexpected error";
    }

    return Promise.reject(new Error(message));
  }
);

// ─── Types ─────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialization: string; // ✅ FIXED
  rating: number;
  fee: number;
  photo?: string;
  resume_image?: string;
  certificate_image?: string;
  certificateImage?: string;
  about?: string;
  experience: {
    years: number;
    months?: number;
  };
}

const normalizeDoctor = (raw: any): Doctor => {
  const years = Number(raw?.experience?.years ?? raw?.experience_years ?? 0);
  const months = Number(raw?.experience?.months ?? raw?.experience_months ?? 0);

  return {
    id: String(raw?.id ?? ""),
    name: String(raw?.name ?? ""),
    specialization: String(raw?.specialization ?? raw?.specialty ?? ""),
    rating: Number(raw?.rating ?? 0),
    fee: Number(raw?.fee ?? 0),
    photo: raw?.photo ?? undefined,
    resume_image: raw?.resume_image ?? raw?.resumeImage ?? undefined,
    certificate_image: raw?.certificate_image ?? raw?.certificateImage ?? undefined,
    certificateImage: raw?.certificateImage ?? raw?.certificate_image ?? undefined,
    about: raw?.about ?? undefined,
    experience: {
      years,
      months,
    },
  };
};

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
}

export interface ApiDocument {
  id: number;
  file_name: string;
  file_url: string;
}

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: string;
  date: string;
  title: "Prescription" | "Report";
  detail: string;
  doctor_name: string;
  documents: ApiDocument[];
}

// ─── Doctor API ────────────────────────────────────────────

export const doctorApi = {
  getAll: async (): Promise<Doctor[]> => {
    const { data } = await api.get("/doctors");
    const rows = Array.isArray(data) ? data : data?.doctors ?? data?.results ?? [];
    return rows.map(normalizeDoctor);
  },

  getById: async (id: string): Promise<Doctor> => {
    const { data } = await api.get(`/doctors/${id}`);
    return normalizeDoctor(data);
  },

  getBySpecialization: async (specialization: string) => {
    const { data } = await api.get<Doctor[]>("/doctors");
    return data.filter((d) => d.specialization === specialization);
  },
};

// ─── Patient API ───────────────────────────────────────────

export const patientApi = {
  getAll: async (): Promise<Patient[]> => {
    const { data } = await api.get("/patients");
    return data;
  },

  getById: async (id: number): Promise<Patient> => {
    const { data } = await api.get(`/patients/${id}`);
    return data;
  },
};

// ─── Prescription API ──────────────────────────────────────

export const prescriptionApi = {
  getAll: async (): Promise<Prescription[]> => {
    const { data } = await api.get("/prescriptions");
    return data;
  },

  getByPatient: async (patientId: number) => {
    const { data } = await api.get(
      `/prescriptions/patient/${patientId}`
    );
    return data;
  },
};

// ─── Document API ──────────────────────────────────────────

export const documentApi = {
  getByPrescription: async (prescriptionId: number) => {
    const { data } = await api.get(
      `/documents/prescription/${prescriptionId}`
    );
    return data;
  },
};