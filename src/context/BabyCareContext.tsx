import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { DAILY_INSIGHTS } from "../data/dailyInsights";
import { DEFAULT_MILESTONES } from "../data/defaultMilestones";
import { WEEKLY_DEVELOPMENT } from "../data/weeklyDevelopment";
import { apiService } from "../services/api";
import {
  BabyCareStats,
  DailyInsight,
  DevelopmentMode,
  DiaperLog,
  FeedingLog,
  JournalEntry,
  Milestone,
  PregnancyData,
  SleepLog,
  VaccinationLog,
  WeekData,
} from "../types";
import { useAuth } from "./AuthContext";

interface BabyCareContextType {
  // Logs
  feedingLogs: FeedingLog[];
  sleepLogs: SleepLog[];
  diaperLogs: DiaperLog[];
  vaccinationLogs: VaccinationLog[];

  // Pregnancy & Development
  pregnancyData: PregnancyData | null;
  developmentMode: DevelopmentMode;
  milestones: Milestone[];
  journalEntries: JournalEntry[];

  // State
  isLoading: boolean;
  error: string | null;

  // Stats
  todayStats: BabyCareStats;

  // Feeding methods
  addFeedingLog: (
    log: Omit<FeedingLog, "_id" | "userId" | "createdAt">,
  ) => Promise<void>;
  updateFeedingLog: (id: string, log: Partial<FeedingLog>) => Promise<void>;
  deleteFeedingLog: (id: string) => Promise<void>;
  getFeedingLogsByDate: (date: string) => FeedingLog[];

  // Sleep methods
  addSleepLog: (
    log: Omit<SleepLog, "_id" | "userId" | "createdAt">,
  ) => Promise<void>;
  updateSleepLog: (id: string, log: Partial<SleepLog>) => Promise<void>;
  deleteSleepLog: (id: string) => Promise<void>;
  getSleepLogsByDate: (date: string) => SleepLog[];

  // Diaper methods
  addDiaperLog: (
    log: Omit<DiaperLog, "_id" | "userId" | "createdAt">,
  ) => Promise<void>;
  deleteDiaperLog: (id: string) => Promise<void>;
  getDiaperLogsByDate: (date: string) => DiaperLog[];

  // Vaccination methods
  addVaccinationLog: (log: Omit<VaccinationLog, "_id">) => Promise<void>;
  updateVaccinationLog: (
    id: string,
    updates: Partial<VaccinationLog>,
  ) => Promise<void>;
  deleteVaccinationLog: (id: string) => Promise<void>;
  getVaccinationLogs: () => VaccinationLog[];

  // Pregnancy methods
  setPregnancyStartDate: (date: string) => Promise<void>;
  getWeekNumber: () => number;
  getDayOfWeek: () => number;

  // Development methods
  setDevelopmentMode: (mode: DevelopmentMode) => Promise<void>;
  getWeekData: (week: number) => WeekData | null;

  // Milestone methods
  addMilestone: (
    milestone: Omit<Milestone, "_id" | "userId" | "createdAt">,
  ) => Promise<void>;
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  getMilestonesByCategory: (category: "pregnancy" | "baby") => Milestone[];

  // Journal methods
  addJournalEntry: (
    entry: Omit<JournalEntry, "_id" | "userId" | "createdAt">,
  ) => Promise<void>;
  updateJournalEntry: (
    id: string,
    updates: Partial<JournalEntry>,
  ) => Promise<void>;
  deleteJournalEntry: (id: string) => Promise<void>;
  getJournalEntries: (limit?: number) => JournalEntry[];

  // Insight methods
  getCurrentInsight: () => DailyInsight | null;

  // Utility
  clearAllData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const BabyCareContext = createContext<BabyCareContextType | undefined>(
  undefined,
);

export const useBabyCare = () => {
  const context = useContext(BabyCareContext);
  if (!context) {
    throw new Error("useBabyCare must be used within BabyCareProvider");
  }
  return context;
};

export const BabyCareProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userData } = useAuth();

  // Logs
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [diaperLogs, setDiaperLogs] = useState<DiaperLog[]>([]);
  const [vaccinationLogs, setVaccinationLogs] = useState<VaccinationLog[]>([]);

  // Pregnancy & Development
  const [pregnancyData, setPregnancyData] = useState<PregnancyData | null>(
    null,
  );
  const [developmentMode, setDevelopmentModeState] =
    useState<DevelopmentMode>("fruit");
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  // Helper: Get today's date in YYYY-MM-DD format
  const getTodayDateStr = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Helper: Calculate today's stats
  const calculateTodayStats = (
    feeding: FeedingLog[],
    sleep: SleepLog[],
    diaper: DiaperLog[],
  ): BabyCareStats => {
    const today = getTodayDateStr();

    const feedingCount = feeding.filter((log) => {
      const logDate = new Date(log.date).toISOString().split("T")[0];
      return logDate === today;
    }).length;

    const sleepMinutes = sleep
      .filter((log) => {
        const logDate = new Date(log.date).toISOString().split("T")[0];
        return logDate === today;
      })
      .reduce((sum, log) => sum + (log.duration || 0), 0);

    const diaperCount = diaper.filter((log) => {
      const logDate = new Date(log.date).toISOString().split("T")[0];
      return logDate === today;
    }).length;

    return { feedingCount, sleepMinutes, diaperCount };
  };

  // Pregnancy calculations
  const getWeekNumber = (): number => {
    if (!pregnancyData) return 0;
    const startDate = new Date(pregnancyData.startDate);
    const today = new Date();
    const diffMs = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7) + 1;
    return Math.min(weeks, 40);
  };

  const getDayOfWeek = (): number => {
    if (!pregnancyData) return 0;
    const startDate = new Date(pregnancyData.startDate);
    const today = new Date();
    const diffMs = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return diffDays % 7;
  };

  // Load all data from API
  const loadData = async () => {
    if (!userData?.id) {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      return;
    }

    try {
      setIsLoading(true);

      // Load feeding logs
      const feedingRes = await apiService.getFeedingLogs();
      const feedingData = feedingRes.data.feedingLogs || [];

      // Load sleep logs
      const sleepRes = await apiService.getSleepLogs();
      const sleepData = sleepRes.data.sleepLogs || [];

      // Load diaper logs
      const diaperRes = await apiService.getDiaperLogs();
      const diaperData = diaperRes.data.diaperLogs || [];

      // Load vaccinations
      const vacRes = await apiService.getVaccinationLogs();
      const vacData = vacRes.data.vaccinationLogs || [];

      // Load pregnancy data
      let pregData = null;
      try {
        const pregRes = await apiService.getPregnancyData();
        pregData = pregRes.data;
      } catch (err) {
        console.log("No pregnancy data yet");
      }

      // Load milestones
      const milesRes = await apiService.getMilestones();
      const milesData =
        milesRes.data.milestones ||
        DEFAULT_MILESTONES.map((m, idx) => ({
          ...m,
          _id: `default-${idx}`,
          userId: userData.id,
          completed: false,
          createdAt: new Date().toISOString(),
        }));

      // Load journal
      const journalRes = await apiService.getJournalEntries({ limit: 100 });
      const journalData = journalRes.data.journalEntries || [];

      if (isMountedRef.current) {
        setFeedingLogs(feedingData);
        setSleepLogs(sleepData);
        setDiaperLogs(diaperData);
        setVaccinationLogs(vacData);
        setPregnancyData(pregData);
        setMilestones(milesData);
        setJournalEntries(journalData);
        setError(null);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          "Failed to load baby care data";
        setError(errorMsg);
        console.error("Failed to load baby care data:", err);
        console.error("Error details:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // ===== FEEDING METHODS =====
  const addFeedingLog = async (
    log: Omit<FeedingLog, "_id" | "userId" | "createdAt">,
  ) => {
    try {
      const res = await apiService.createFeedingLog(log);
      setFeedingLogs([res.data, ...feedingLogs]);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to add feeding log");
    }
  };

  const updateFeedingLog = async (id: string, updates: Partial<FeedingLog>) => {
    try {
      const res = await apiService.updateFeedingLog(id, updates);
      setFeedingLogs(
        feedingLogs.map((log) => (log._id === id ? res.data : log)),
      );
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to update feeding log",
      );
    }
  };

  const deleteFeedingLog = async (id: string) => {
    try {
      await apiService.deleteFeedingLog(id);
      setFeedingLogs(feedingLogs.filter((log) => log._id !== id));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to delete feeding log",
      );
    }
  };

  const getFeedingLogsByDate = (date: string) => {
    return feedingLogs.filter((log) => {
      const logDate = new Date(log.date).toISOString().split("T")[0];
      return logDate === date;
    });
  };

  // ===== SLEEP METHODS =====
  const addSleepLog = async (
    log: Omit<SleepLog, "_id" | "userId" | "createdAt">,
  ) => {
    try {
      const res = await apiService.createSleepLog(log);
      setSleepLogs([res.data, ...sleepLogs]);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to add sleep log");
    }
  };

  const updateSleepLog = async (id: string, updates: Partial<SleepLog>) => {
    try {
      const res = await apiService.updateSleepLog(id, updates);
      setSleepLogs(sleepLogs.map((log) => (log._id === id ? res.data : log)));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to update sleep log",
      );
    }
  };

  const deleteSleepLog = async (id: string) => {
    try {
      await apiService.deleteSleepLog(id);
      setSleepLogs(sleepLogs.filter((log) => log._id !== id));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to delete sleep log",
      );
    }
  };

  const getSleepLogsByDate = (date: string) => {
    return sleepLogs.filter((log) => {
      const logDate = new Date(log.date).toISOString().split("T")[0];
      return logDate === date;
    });
  };

  // ===== DIAPER METHODS =====
  const addDiaperLog = async (
    log: Omit<DiaperLog, "_id" | "userId" | "createdAt">,
  ) => {
    try {
      const res = await apiService.createDiaperLog(log);
      setDiaperLogs([res.data, ...diaperLogs]);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to add diaper log");
    }
  };

  const deleteDiaperLog = async (id: string) => {
    try {
      await apiService.deleteDiaperLog(id);
      setDiaperLogs(diaperLogs.filter((log) => log._id !== id));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to delete diaper log",
      );
    }
  };

  const getDiaperLogsByDate = (date: string) => {
    return diaperLogs.filter((log) => {
      const logDate = new Date(log.date).toISOString().split("T")[0];
      return logDate === date;
    });
  };

  // ===== VACCINATION METHODS =====
  const addVaccinationLog = async (log: Omit<VaccinationLog, "_id">) => {
    try {
      const res = await apiService.createVaccinationLog(log);
      setVaccinationLogs([res.data, ...vaccinationLogs]);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to add vaccination");
    }
  };

  const updateVaccinationLog = async (
    id: string,
    updates: Partial<VaccinationLog>,
  ) => {
    try {
      const res = await apiService.updateVaccinationLog(id, updates);
      setVaccinationLogs(
        vaccinationLogs.map((log) => (log._id === id ? res.data : log)),
      );
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to update vaccination",
      );
    }
  };

  const deleteVaccinationLog = async (id: string) => {
    try {
      await apiService.deleteVaccinationLog(id);
      setVaccinationLogs(vaccinationLogs.filter((log) => log._id !== id));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to delete vaccination",
      );
    }
  };

  const getVaccinationLogs = () => vaccinationLogs;

  // ===== PREGNANCY METHODS =====
  const setPregnancyStartDate = async (date: string) => {
    try {
      if (pregnancyData) {
        // Update existing
        const res = await apiService.updatePregnancyData({ startDate: date });
        setPregnancyData(res.data);
      } else {
        // Create new
        const res = await apiService.createPregnancyData({ startDate: date });
        setPregnancyData(res.data);
      }
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to set pregnancy date",
      );
    }
  };

  // ===== DEVELOPMENT METHODS =====
  const setDevelopmentMode = async (mode: DevelopmentMode) => {
    setDevelopmentModeState(mode);
    // Mode is stored locally for now (no backend endpoint needed)
  };

  const getWeekData = (week: number): WeekData | null => {
    return WEEKLY_DEVELOPMENT[week - 1] || null;
  };

  // ===== MILESTONE METHODS =====
  const addMilestone = async (
    milestone: Omit<Milestone, "_id" | "userId" | "createdAt">,
  ) => {
    try {
      const res = await apiService.createMilestone(milestone);
      setMilestones([res.data, ...milestones]);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || "Failed to add milestone");
    }
  };

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      const res = await apiService.updateMilestone(id, updates);
      setMilestones(milestones.map((m) => (m._id === id ? res.data : m)));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to update milestone",
      );
    }
  };

  const deleteMilestone = async (id: string) => {
    try {
      await apiService.deleteMilestone(id);
      setMilestones(milestones.filter((m) => m._id !== id));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to delete milestone",
      );
    }
  };

  const getMilestonesByCategory = (category: "pregnancy" | "baby") => {
    return milestones.filter((m) => m.category === category);
  };

  // ===== JOURNAL METHODS =====
  const addJournalEntry = async (
    entry: Omit<JournalEntry, "_id" | "userId" | "createdAt">,
  ) => {
    try {
      const res = await apiService.createJournalEntry(entry);
      setJournalEntries([res.data, ...journalEntries]);
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to add journal entry",
      );
    }
  };

  const updateJournalEntry = async (
    id: string,
    updates: Partial<JournalEntry>,
  ) => {
    try {
      const res = await apiService.updateJournalEntry(id, updates);
      setJournalEntries(
        journalEntries.map((j) => (j._id === id ? res.data : j)),
      );
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to update journal entry",
      );
    }
  };

  const deleteJournalEntry = async (id: string) => {
    try {
      await apiService.deleteJournalEntry(id);
      setJournalEntries(journalEntries.filter((j) => j._id !== id));
    } catch (err: any) {
      throw new Error(
        err.response?.data?.error || "Failed to delete journal entry",
      );
    }
  };

  const getJournalEntries = (limit?: number) => {
    return limit ? journalEntries.slice(0, limit) : journalEntries;
  };

  // ===== INSIGHT METHODS =====
  const getCurrentInsight = (): DailyInsight | null => {
    if (!pregnancyData) return null;

    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(pregnancyData.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const week = getWeekNumber();
    const insightsForWeek = DAILY_INSIGHTS.filter((insight) => {
      if (insight.category !== "pregnancy") return false;
      if (insight.minWeek && week < insight.minWeek) return false;
      if (insight.maxWeek && week > insight.maxWeek) return false;
      return true;
    });

    if (insightsForWeek.length === 0) return null;
    return insightsForWeek[dayOfYear % insightsForWeek.length];
  };

  // ===== UTILITY METHODS =====
  const clearAllData = async () => {
    try {
      setFeedingLogs([]);
      setSleepLogs([]);
      setDiaperLogs([]);
      setVaccinationLogs([]);
      setPregnancyData(null);
      setMilestones([]);
      setJournalEntries([]);
    } catch (err) {
      throw new Error("Failed to clear data");
    }
  };

  const refreshAllData = async () => {
    await loadData();
  };

  // Calculate today's stats
  const todayStats = calculateTodayStats(feedingLogs, sleepLogs, diaperLogs);

  // Effects
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (userData?.id) {
      loadData();
    }
  }, [userData?.id]);

  const value: BabyCareContextType = {
    feedingLogs,
    sleepLogs,
    diaperLogs,
    vaccinationLogs,
    pregnancyData,
    developmentMode,
    milestones,
    journalEntries,
    isLoading,
    error,
    todayStats,
    addFeedingLog,
    updateFeedingLog,
    deleteFeedingLog,
    getFeedingLogsByDate,
    addSleepLog,
    updateSleepLog,
    deleteSleepLog,
    getSleepLogsByDate,
    addDiaperLog,
    deleteDiaperLog,
    getDiaperLogsByDate,
    addVaccinationLog,
    updateVaccinationLog,
    deleteVaccinationLog,
    getVaccinationLogs,
    setPregnancyStartDate,
    getWeekNumber,
    getDayOfWeek,
    setDevelopmentMode,
    getWeekData,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getMilestonesByCategory,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    getJournalEntries,
    getCurrentInsight,
    clearAllData,
    refreshAllData,
  };

  return (
    <BabyCareContext.Provider value={value}>
      {children}
    </BabyCareContext.Provider>
  );
};
