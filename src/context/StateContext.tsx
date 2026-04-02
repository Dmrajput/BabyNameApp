import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { getStatesByCountry } from "../services/api";
import { StateOption } from "../types";
import { useCountry } from "./CountryContext";

const STATE_SELECTION_STORAGE_KEY = "stateSelectionByCountry";
const STATES_CACHE_STORAGE_KEY = "statesCacheByCountry";
const DEFAULT_STATE: StateOption = "All";

type StateContextType = {
  selectedState: StateOption;
  states: StateOption[];
  isStateLoading: boolean;
  setSelectedState: (state: StateOption) => Promise<void>;
};

const StateContext = createContext<StateContextType | undefined>(undefined);

type StateSelectionMap = Record<string, StateOption>;
type StatesCacheMap = Record<string, StateOption[]>;

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const { selectedCountry } = useCountry();
  const [selectedState, setSelectedStateState] =
    useState<StateOption>(DEFAULT_STATE);
  const [states, setStates] = useState<StateOption[]>([]);
  const [isStateLoading, setIsStateLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStates = async () => {
      setIsStateLoading(true);

      try {
        const [savedSelectionRaw, cachedStatesRaw] = await Promise.all([
          AsyncStorage.getItem(STATE_SELECTION_STORAGE_KEY),
          AsyncStorage.getItem(STATES_CACHE_STORAGE_KEY),
        ]);

        const selectionMap: StateSelectionMap = savedSelectionRaw
          ? JSON.parse(savedSelectionRaw)
          : {};
        const statesCacheMap: StatesCacheMap = cachedStatesRaw
          ? JSON.parse(cachedStatesRaw)
          : {};

        const cachedStatesForCountry = Array.isArray(
          statesCacheMap[selectedCountry],
        )
          ? statesCacheMap[selectedCountry]
          : [];

        const cachedStateOptions = cachedStatesForCountry.filter(
          (item, index, arr) =>
            typeof item === "string" &&
            item.trim() &&
            arr.indexOf(item) === index,
        );

        if (isMounted) {
          setStates(cachedStateOptions);

          const savedSelection = selectionMap[selectedCountry];
          const selectedFromCache =
            savedSelection && cachedStateOptions.includes(savedSelection)
              ? savedSelection
              : DEFAULT_STATE;

          setSelectedStateState(selectedFromCache);
          setIsStateLoading(false);
        }

        const remoteStates = await getStatesByCountry(selectedCountry);

        if (!isMounted) {
          return;
        }

        setStates(remoteStates);

        const remoteSelection =
          selectionMap[selectedCountry] &&
          remoteStates.includes(selectionMap[selectedCountry])
            ? selectionMap[selectedCountry]
            : DEFAULT_STATE;

        setSelectedStateState(remoteSelection);

        const nextSelectionMap = {
          ...selectionMap,
          [selectedCountry]: remoteSelection,
        };

        const nextStatesCacheMap = {
          ...statesCacheMap,
          [selectedCountry]: remoteStates,
        };

        await Promise.all([
          AsyncStorage.setItem(
            STATE_SELECTION_STORAGE_KEY,
            JSON.stringify(nextSelectionMap),
          ),
          AsyncStorage.setItem(
            STATES_CACHE_STORAGE_KEY,
            JSON.stringify(nextStatesCacheMap),
          ),
        ]);
      } catch {
        if (isMounted) {
          setStates([]);
          setSelectedStateState(DEFAULT_STATE);
          setIsStateLoading(false);
        }
      } finally {
        if (isMounted) {
          setIsStateLoading(false);
        }
      }
    };

    void loadStates();

    return () => {
      isMounted = false;
    };
  }, [selectedCountry]);

  const setSelectedState = async (state: StateOption) => {
    setSelectedStateState(state);

    try {
      const existing = await AsyncStorage.getItem(STATE_SELECTION_STORAGE_KEY);
      const parsed: StateSelectionMap = existing ? JSON.parse(existing) : {};

      const next = {
        ...parsed,
        [selectedCountry]: state,
      };

      await AsyncStorage.setItem(
        STATE_SELECTION_STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Ignore storage write failures; in-memory state remains valid.
    }
  };

  const value = useMemo(
    () => ({
      selectedState,
      states,
      isStateLoading,
      setSelectedState,
    }),
    [selectedState, states, isStateLoading],
  );

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};

export const useStateFilter = () => {
  const context = useContext(StateContext);

  if (!context) {
    throw new Error("useStateFilter must be used inside StateProvider.");
  }

  return context;
};
