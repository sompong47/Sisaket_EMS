export interface Product {
  _id?: string;
  name: string;
  quantity: number;
  unit: string;
  minAlert: number;
  image?: string;
}

export interface Center {
  _id?: string;
  name: string;
  location: string;
  population: number;
  status: 'active' | 'inactive';
}

export interface TransferRequest {
  _id?: string;
  fromCenter?: string; // ถ้า null คือจากส่วนกลาง
  toCenter: string;
  items: {
    productId: string;
    productName: string;
    qty: number;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: Date;
}