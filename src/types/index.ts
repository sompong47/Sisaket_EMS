export interface Center {
  _id?: string;
  name: string;
  code: string;
  type: 'central' | 'shelter';
  status: 'active' | 'inactive';
}

export interface Product {
  _id?: string;
  name: string;
  code: string;
  unit: string;
  category: string;
}

export interface Inventory {
  _id?: string;
  centerId: string;
  productId: string;
  quantity: number;
}

export interface Transfer {
  _id?: string;
  from: string;
  to: string;
  items: TransferItem[];
  status: 'pending' | 'approved' | 'completed';
  createdAt: Date;
}

export interface TransferItem {
  productId: string;
  quantity: number;
}