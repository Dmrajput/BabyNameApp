export type GenderFilter = 'All' | 'Boy' | 'Girl';

export type CategoryId = 'Hindu' | 'Muslim' | 'Modern' | 'Trending';

export type BabyName = {
  name: string;
  meaning: string;
  origin: string;
  gender: 'Boy' | 'Girl';
  category: CategoryId;
};

export type CategoryItem = {
  id: CategoryId;
  title: string;
  icon: string;
  color: string;
};

export type HomeStackParamList = {
  Home: undefined;
  NameList: {
    category: CategoryId;
    title: string;
    initialQuery?: string;
  };
  NameDetail: {
    babyName: BabyName;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  Generator: undefined;
  Favorites: undefined;
};
