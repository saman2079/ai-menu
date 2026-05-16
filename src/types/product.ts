export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    _id: string;
    name: string;
  };
  isAvailable: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  title: string;
  image?: string;
  isActive: boolean;
}
