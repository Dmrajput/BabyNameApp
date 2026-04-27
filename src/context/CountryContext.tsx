import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getCountries } from "../services/api";
import { CountryItem, CountryOption } from "../types";
import { useAuth } from "./AuthContext";

const COUNTRY_STORAGE_KEY = "selectedCountry";
const COUNTRIES_STORAGE_KEY = "countriesCache";
const DEFAULT_COUNTRY: CountryOption = "India";
const FALLBACK_COUNTRIES: CountryItem[] = [
  { code: "India", label: "India", flag: "🇮🇳" },
  { code: "United States", label: "United States", flag: "🇺🇸" },
  { code: "UK", label: "UK", flag: "🇬🇧" },
  { code: "UAE", label: "UAE", flag: "🇦🇪" },
  { code: "Canada", label: "Canada", flag: "🇨🇦" },
];

type CountryContextType = {
  selectedCountry: CountryOption;
  countries: CountryItem[];
  isCountryLoading: boolean;
  setSelectedCountry: (country: CountryOption) => Promise<void>;
};

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const CountryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { userData } = useAuth();
  const userCountry = userData?.country?.toString().trim();
  const storageKey = userData?.id
    ? `${COUNTRY_STORAGE_KEY}:${userData.id}`
    : COUNTRY_STORAGE_KEY;
  const [selectedCountry, setSelectedCountryState] =
    useState<CountryOption>(DEFAULT_COUNTRY);
  const [countries, setCountries] = useState<CountryItem[]>(FALLBACK_COUNTRIES);
  const [isCountryLoading, setIsCountryLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCountries = async () => {
      try {
        const [savedCountry, cachedCountriesRaw, legacyCountry] =
          await Promise.all([
            AsyncStorage.getItem(storageKey),
            AsyncStorage.getItem(COUNTRIES_STORAGE_KEY),
            storageKey !== COUNTRY_STORAGE_KEY
              ? AsyncStorage.getItem(COUNTRY_STORAGE_KEY)
              : Promise.resolve(null),
          ]);
        const persistedCountry = savedCountry || legacyCountry;

        let initialCountries = FALLBACK_COUNTRIES;

        if (cachedCountriesRaw) {
          try {
            const parsed = JSON.parse(cachedCountriesRaw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialCountries = parsed;
            }
          } catch {
            // Ignore corrupted cache and keep fallback countries.
          }
        }

        if (isMounted) {
          setCountries(initialCountries);

          const savedIsValid = persistedCountry
            ? initialCountries.some((item) => item.code === persistedCountry)
            : false;
          const userIsValid = userCountry
            ? initialCountries.some((item) => item.code === userCountry)
            : false;
          const defaultIsValid = initialCountries.some(
            (item) => item.code === DEFAULT_COUNTRY,
          );
          const nextSelected = savedIsValid
            ? persistedCountry
            : userIsValid
              ? userCountry
              : defaultIsValid
                ? DEFAULT_COUNTRY
                : initialCountries[0]?.code || DEFAULT_COUNTRY;

          setSelectedCountryState(nextSelected);
          if (nextSelected && nextSelected !== persistedCountry) {
            void AsyncStorage.setItem(storageKey, nextSelected);
          }
          setIsCountryLoading(false);
        }

        const remoteCountries = await getCountries();

        if (!isMounted || !remoteCountries.length) {
          return;
        }

        setCountries(remoteCountries);
        await AsyncStorage.setItem(
          COUNTRIES_STORAGE_KEY,
          JSON.stringify(remoteCountries),
        );

        setSelectedCountryState((current) => {
          const currentIsValid = remoteCountries.some(
            (item) => item.code === current,
          );

          if (currentIsValid) {
            return current;
          }

          const userIsValid = userCountry
            ? remoteCountries.some((item) => item.code === userCountry)
            : false;
          const defaultIsValid = remoteCountries.some(
            (item) => item.code === DEFAULT_COUNTRY,
          );
          const fallback = userIsValid
            ? userCountry
            : defaultIsValid
              ? DEFAULT_COUNTRY
              : remoteCountries[0].code;
          void AsyncStorage.setItem(storageKey, fallback);
          return fallback;
        });
      } catch {
        if (isMounted) {
          setIsCountryLoading(false);
        }
      }
    };

    void loadCountries();

    return () => {
      isMounted = false;
    };
  }, [storageKey, userCountry]);

  const setSelectedCountry = async (country: CountryOption) => {
    setSelectedCountryState(country);

    try {
      await AsyncStorage.setItem(storageKey, country);
    } catch {
      // Ignore storage write failure; in-memory state already updated.
    }
  };

  const value = useMemo(
    () => ({
      selectedCountry,
      countries,
      isCountryLoading,
      setSelectedCountry,
    }),
    [selectedCountry, countries, isCountryLoading],
  );

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
};

export const useCountry = () => {
  const context = useContext(CountryContext);

  if (!context) {
    throw new Error("useCountry must be used inside CountryProvider.");
  }

  return context;
};
