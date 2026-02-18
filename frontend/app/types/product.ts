export interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  imageUrls?: string[];
  colors?: string[];
  createdAt?: string;
  updatedAt?: string;
}
