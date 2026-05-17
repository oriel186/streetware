export type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: "Hoodies" | "T-Shirts" | "Pants" | "Sneakers" | "Accessories";
  sizes: string[];
  colors: string[];
  weightOptions: string[];
  shoeSizes: string[];
  stock: number;
  description: string;
  featured?: boolean;
  bestSeller?: boolean;
};

export type User = {
  username?: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  birthDate?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  shoeSize: string;
  color: string;
  quantity: number;
};

export type PaymentMethod = "especes" | "carte";
export type OrderStatus = "en attente" | "payee" | "traitee" | "expediee" | "livree";

export type CustomerInfo = {
  fullName: string;
  phone: string;
  address: string;
  email: string;
  notes?: string;
};

export type Order = {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  total: number;
  createdAt: string;
};
