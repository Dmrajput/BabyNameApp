export type GenderFilter = 'All' | 'Boy' | 'Girl';

export type BabyName = {
  _id: string;
  name: string;
  meaning: string;
  origin: string;
  gender: 'Boy' | 'Girl';
  category: string;
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
