export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  createdAt: string;
  _count?: {
    transactions: number;
    budgets: number;
  };
}

export interface CreateCategoryPayload {
  name: string;
  type: TransactionType;
  color?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string | null;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionPayload {
  title: string;
  amount: number;
  type: TransactionType;
  date: string;
  categoryId: string;
  note?: string;
}

export interface UpdateTransactionPayload {
  title?: string;
  amount?: number;
  type?: TransactionType;
  date?: string;
  categoryId?: string;
  note?: string;
}

export interface TransactionFilter {
  month?: string;
  type?: TransactionType;
  categoryId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  month: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usagePercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertBudgetPayload {
  categoryId: string;
  month: string;
  limitAmount: number;
}

export interface DashboardSummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netCashFlow: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  netCashFlow: number;
}
