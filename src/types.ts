export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
  isAdmin?: boolean;
}

export type PartType = 'adapter' | 'battery' | 'motherboard' | 'screen' | 'ram' | 'ssd';

export interface LaptopPart {
  id: string;
  name: string;
  type: PartType;
  brand: string;
  compatibleModels: string[];
  price: number;
  stock: number;
  description: string;
  image: string;
}

export interface LaptopIssue {
  id: string;
  name: string;
  category: string;
  baseRepairCost: number;
  estimatedHours: string;
  description: string;
}

export type BookingStatus = 'pending' | 'received' | 'diagnosing' | 'repairing' | 'ready' | 'delivered';

export interface Booking {
  id: string;
  userId: string;
  brand: string;
  model: string;
  serialNumber?: string;
  issues: string[]; // LaptopIssue IDs
  additionalNotes?: string;
  quoteAmount: number;
  status: BookingStatus;
  scheduledDate: string;
  serviceType: 'home_pickup' | 'store_visit';
  paymentStatus: 'pending' | 'paid';
  createdAt: string;
}

export interface PartPurchase {
  id: string;
  userId: string;
  partId: string;
  partName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  status: 'processing' | 'shipped' | 'delivered';
  shippingAddress: string;
  createdAt: string;
}
