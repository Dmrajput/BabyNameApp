export type GenderFilter = "All" | "Boy" | "Girl";

export type NameGender = "Boy" | "Girl" | "Unisex";

export type CountryOption = string;
export type StateOption = string;

export type CountryItem = {
  code: string;
  label: string;
  flag: string;
};

export type BabyName = {
  _id: string;
  name: string;
  meaning: string;
  origin: string;
  gender: NameGender;
  category: string;
  country?: string;
  state?: string;
  rating?: number;
  favoriteCount?: number;
  favoriteId?: string;
  favoriteCreatedAt?: string;
};

export type GeneratedName = {
  name: string;
  meaning: string;
  gender: NameGender;
};

export type CategoryItem = {
  id: string;
  title: string;
  icon: string;
  color: string;
};

export type HomeStackParamList = {
  Home: undefined;
  NameList: {
    category: string;
    title: string;
    initialQuery?: string;
  };
  NameDetail: {
    nameId: string;
  };
};

// Baby Care Types
export type FeedingLog = {
  _id: string;
  userId: string;
  date: string; // ISO 8601 date
  type: "breastfeeding" | "bottle";
  duration?: number; // minutes (for breastfeeding)
  side?: "left" | "right" | "both";
  volume?: number; // ml (for bottle)
  createdAt: string;
};

export type SleepLog = {
  _id: string;
  userId: string;
  date: string; // ISO 8601 date
  startTime: string; // ISO 8601 datetime
  endTime?: string; // ISO 8601 datetime
  duration?: number; // minutes
  notes?: string;
  createdAt: string;
};

export type DiaperLog = {
  _id: string;
  userId: string;
  date: string; // ISO 8601 date
  type: "wet" | "dirty" | "both";
  createdAt: string;
};

export type VaccinationLog = {
  _id: string;
  userId?: string;
  vaccineName: string;
  vaccineDate?: string; // ISO 8601 date
  nextDueDate?: string; // ISO 8601 date
  status: "pending" | "completed";
  notes?: string;
};

export type BabyCareLog = FeedingLog | SleepLog | DiaperLog | VaccinationLog;

export type BabyCareStats = {
  feedingCount: number;
  sleepMinutes: number;
  diaperCount: number;
};

// Pregnancy & Development Types
export type PregnancyData = {
  userId: string;
  startDate: string; // ISO 8601 date (e.g., "2025-10-15")
  createdAt: string;
};

export type DevelopmentMode = "fruit" | "animal" | "object";

export type DevelopmentPreference = {
  userId: string;
  comparisonMode: DevelopmentMode;
  updatedAt: string;
};

export type WeekData = {
  week: number;
  fruitComparison: string; // e.g., "🥭 Mango"
  animalComparison: string; // e.g., "🐰 Rabbit"
  objectComparison: string; // e.g., "💻 Laptop"
  motherFeel: string[]; // symptoms/sensations
  babyDevelopment: string[]; // milestones/development points
  size?: {
    length: string; // e.g., "8 inches"
    weight: string; // e.g., "1 lb"
  };
};

export type Milestone = {
  _id: string;
  userId: string;
  category: "pregnancy" | "baby";
  title: string; // e.g., "First kick", "First smile"
  week?: number; // pregnancy week
  ageWeeks?: number; // baby age in weeks
  completed: boolean;
  completedDate?: string; // ISO 8601 date
  notes?: string;
  imageUrl?: string;
  createdAt: string;
};

export type JournalEntry = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string; // ISO 8601 date
  createdAt: string;
};

export type DailyInsight = {
  id: string;
  text: string;
  icon: string;
  category: "pregnancy" | "baby";
  minWeek?: number;
  maxWeek?: number;
};

export type BabyCareStackParamList = {
  BabyCareHome: undefined;
  Feeding: undefined;
  Sleep: undefined;
  Diaper: undefined;
  Vaccination: undefined;
  Pregnancy: undefined;
  Development: undefined;
  Milestones: undefined;
  Journal: undefined;
  AddJournal: { editId?: string };
};

export type TabParamList = {
  HomeTab: undefined;
  Generator: undefined;
  BabyCare: undefined;
  Favorites: undefined;
  Profile: undefined;
  Admin: undefined;
};
