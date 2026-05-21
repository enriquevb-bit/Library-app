// Enums
export type MemberState = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'INACTIVE';
export type LoanState = 'RESERVED' | 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'CANCELLED';
export type UserRole = 'ADMIN' | 'MEMBER';

// DTOs matching Spring backend
export interface BookDTO {
  id?: string;
  version?: number;
  isbn: string;
  title: string;
  availableCopies: number;
  price: number;
  publishedDate?: string;
  lastModifiedDate?: string;
  authors?: AuthorDTO[];
  genres?: GenreDTO[];
}

export interface AuthorDTO {
  id?: string;
  version?: number;
  fullName: string;
  nationality?: string;
  birthDate?: string;
}

export interface GenreDTO {
  id?: string;
  version?: number;
  name: string;
  description?: string;
}

export interface MemberDTO {
  id?: string;
  version?: number;
  name: string;
  email: string;
  memberState: MemberState;
  registerDate?: string;
}

export interface LoanLineDTO {
  id?: string;
  version?: number;
  orderedQuantity: number;
  returnedQuantity?: number;
  book: BookDTO;
}

export interface LoanDTO {
  id?: string;
  version?: number;
  loanState: LoanState;
  loanDate?: string;
  expiringDate?: string;
  dueDate?: string;
  loanLines?: LoanLineDTO[];
  member?: MemberDTO;
}

export interface RequestedLoanItem {
  bookId: string;
  quantity: number;
}

// Spring Page response
export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
