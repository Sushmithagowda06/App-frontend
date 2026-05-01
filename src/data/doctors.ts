export type SlotStatus = "available" | "limited" | "unavailable";
export type SlotGroup = "Morning" | "Afternoon" | "Evening";

export type Slot = {
  id: string;
  time: string;
  status: SlotStatus;
  group: SlotGroup;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  rating: number;
  fee: number;
  photo?: string;
  experience: {
    years: number;
    months?: number;
  };
  slotsByDate: Record<string, Slot[]>;
};

const DAYS_TO_SHOW = 7;

export const getDateLabel = (date: Date) => {
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const dayNum = date.getDate();
  return { day, dayNum, key: date.toISOString().split("T")[0] };
};

export const buildUpcomingDates = (daysToShow: number = DAYS_TO_SHOW) => {
  const now = new Date();
  return Array.from({ length: daysToShow }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    return getDateLabel(d);
  });
};

export const upcomingDates = buildUpcomingDates();

export const sampleDoctors: Doctor[] = [
  {
    id: "doc-1",
    name: "Dr. Sheryas",
    specialization: "General Physician",
    rating: 4.8,
    fee: 500,
    experience: {
      years: 4,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "1", time: "09:00 AM", status: "available", group: "Morning" },
        { id: "2", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "3", time: "11:00 AM", status: "unavailable", group: "Morning" },
        { id: "4", time: "02:00 PM", status: "available", group: "Afternoon" },
        { id: "5", time: "06:30 PM", status: "available", group: "Evening" },
      ],
      [upcomingDates[1].key]: [
        { id: "6", time: "10:00 AM", status: "available", group: "Morning" },
        { id: "7", time: "12:30 PM", status: "limited", group: "Afternoon" },
        { id: "8", time: "07:00 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-2",
    name: "Dr.Rohit",
    specialization: "Dermatologist",
    rating: 4.6,
    fee: 600,
    experience: {
      years: 2,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "9", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "10", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "11", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "12", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "13", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-3",
    name: "Dr.Bharath",
    specialization: "Dermatologist",
    rating: 4.6,
    fee: 400,
    experience: {
      years: 10,
      months: 0,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "14", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "15", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "16", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "17", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "18", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-4",
    name: "Dr.Chandrashekar",
    specialization: "Cardiologist",
    rating: 4.6,
    fee: 800,
    experience: {
      years: 8,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "19", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "20", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "21", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "22", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "23", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-5",
    name: "Dr.Soujanya",
    specialization: "General Physician",
    rating: 4.6,
    fee: 800,
    experience: {
      years: 10,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "24", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "25", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "26", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "27", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "28", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-6",
    name: "Dr.Neah Naidu",
    specialization: "General Physician",
    rating: 4.6,
    fee: 700,
    experience: {
      years: 12,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "29", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "30", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "31", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "32", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "33", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-7",
    name: "Dr.Hemanth",
    specialization: "General Physician",
    rating: 4.6,
    fee: 500,
    experience: {
      years: 8,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "34", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "35", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "36", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "37", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "38", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
  {
    id: "doc-8",
    name: "Dr.Anudeep",
    specialization: "General Physician",
    rating: 4.6,
    fee: 600,
    experience: {
      years: 6,
      months: 6,
    },
    slotsByDate: {
      [upcomingDates[0].key]: [
        { id: "39", time: "08:30 AM", status: "available", group: "Morning" },
        { id: "40", time: "03:00 PM", status: "available", group: "Afternoon" },
        { id: "41", time: "04:00 PM", status: "unavailable", group: "Afternoon" },
      ],
      [upcomingDates[2].key]: [
        { id: "42", time: "09:30 AM", status: "limited", group: "Morning" },
        { id: "43", time: "05:30 PM", status: "available", group: "Evening" },
      ],
    },
  },
];
