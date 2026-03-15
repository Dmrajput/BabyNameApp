export type GenderFilter = 'All' | 'Boy' | 'Girl';

export type NameGender = 'Boy' | 'Girl' | 'Unisex';

export type BabyName = {
  _id: string;
  name: string;
  meaning: string;
  origin: string;
  gender: NameGender;
  category: string;
  rating?: number;
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

export type TabParamList = {
  HomeTab: undefined;
  Generator: undefined;
  Favorites: undefined;
};
