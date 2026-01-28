
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface CashTransaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  date: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  checked: boolean;
  category?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  budget: number;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  updatedAt: number;
}

export interface Reminder {
  id: string;
  text: string;
  dueDate: string;
  completed: boolean;
}

export type AppView = 'dashboard' | 'shopping' | 'cash' | 'notes' | 'reminders';
