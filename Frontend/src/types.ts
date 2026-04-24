export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  hoverImage?: string;
  description: string;
  color?: string;
  material?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: { product: Product; quantity: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt?: string;
  shippingAddress: {
    firstName: string;
    lastName?: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
  };
}
