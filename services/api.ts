import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';
import {
  BookDTO,
  AuthorDTO,
  GenreDTO,
  MemberDTO,
  LoanDTO,
  RequestedLoanItem,
  PageResponse,
} from '@/types';

async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Error ${response.status}`;
  let text = '';
  try {
    text = await response.text();
  } catch {
    return fallback;
  }
  if (!text) return fallback;
  try {
    const json = JSON.parse(text);
    const msg = json.detail || json.message || json.error || json.title;
    if (typeof msg === 'string' && msg.trim()) return msg;
  } catch {
    // not JSON
  }
  return text.length <= 200 ? text : fallback;
}

// Generic fetch wrapper with JWT auth
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  if (!token) {
    throw new Error('No autenticado');
  }
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&');
}

// Extract ID from Location header after POST (201)
function getIdFromLocation(locationHeader: string | null): string | null {
  if (!locationHeader) return null;
  const parts = locationHeader.split('/');
  return parts[parts.length - 1];
}

// POST that returns the ID from Location header
async function createRequest(endpoint: string, body: unknown): Promise<string | null> {
  const token = await getToken();
  if (!token) {
    throw new Error('No autenticado');
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
  return getIdFromLocation(response.headers.get('Location'));
}

// ==================== BOOKS ====================

export async function getBooks(params?: {
  title?: string;
  isbn?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PageResponse<BookDTO>> {
  const query = buildQuery(params ?? {});
  return request(`/book${query}`);
}

export async function getBook(id: string): Promise<BookDTO> {
  return request(`/book/${id}`);
}

export async function createBook(book: BookDTO): Promise<string | null> {
  return createRequest('/book', book);
}

export async function updateBook(id: string, book: BookDTO): Promise<void> {
  return request(`/book/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  });
}

export async function patchBook(id: string, fields: Partial<BookDTO>): Promise<void> {
  return request(`/book/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function deleteBook(id: string): Promise<void> {
  return request(`/book/${id}`, { method: 'DELETE' });
}

// ==================== AUTHORS ====================

export async function getAuthors(params?: {
  fullName?: string;
  nationality?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PageResponse<AuthorDTO>> {
  const query = buildQuery(params ?? {});
  return request(`/author${query}`);
}

export async function getAuthor(id: string): Promise<AuthorDTO> {
  return request(`/author/${id}`);
}

export async function createAuthor(author: AuthorDTO): Promise<string | null> {
  return createRequest('/author', author);
}

export async function updateAuthor(id: string, author: AuthorDTO): Promise<void> {
  return request(`/author/${id}`, {
    method: 'PUT',
    body: JSON.stringify(author),
  });
}

export async function patchAuthor(id: string, fields: Partial<AuthorDTO>): Promise<void> {
  return request(`/author/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function deleteAuthor(id: string): Promise<void> {
  return request(`/author/${id}`, { method: 'DELETE' });
}

// ==================== GENRES ====================

export async function getGenres(params?: {
  name?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PageResponse<GenreDTO>> {
  const query = buildQuery(params ?? {});
  return request(`/genre${query}`);
}

export async function getGenre(id: string): Promise<GenreDTO> {
  return request(`/genre/${id}`);
}

export async function createGenre(genre: GenreDTO): Promise<string | null> {
  return createRequest('/genre', genre);
}

export async function updateGenre(id: string, genre: GenreDTO): Promise<void> {
  return request(`/genre/${id}`, {
    method: 'PUT',
    body: JSON.stringify(genre),
  });
}

export async function patchGenre(id: string, fields: Partial<GenreDTO>): Promise<void> {
  return request(`/genre/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function deleteGenre(id: string): Promise<void> {
  return request(`/genre/${id}`, { method: 'DELETE' });
}

// ==================== MEMBERS ====================

export async function getMembers(params?: {
  name?: string;
  email?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PageResponse<MemberDTO>> {
  const query = buildQuery(params ?? {});
  return request(`/member${query}`);
}

export async function getMember(id: string): Promise<MemberDTO> {
  return request(`/member/${id}`);
}

export async function createMember(member: MemberDTO): Promise<string | null> {
  return createRequest('/member', member);
}

export async function updateMember(id: string, member: MemberDTO): Promise<void> {
  return request(`/member/${id}`, {
    method: 'PUT',
    body: JSON.stringify(member),
  });
}

export async function patchMember(id: string, fields: Partial<MemberDTO>): Promise<void> {
  return request(`/member/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function deleteMember(id: string): Promise<void> {
  return request(`/member/${id}`, { method: 'DELETE' });
}

// Create loan for a member
export async function createLoan(
  memberId: string,
  items: RequestedLoanItem[]
): Promise<string | null> {
  return createRequest(`/member/${memberId}/loan`, items);
}

// ==================== LOANS ====================

export async function getLoans(params?: {
  loanState?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PageResponse<LoanDTO>> {
  const query = buildQuery(params ?? {});
  return request(`/loan${query}`);
}

export async function getLoan(id: string): Promise<LoanDTO> {
  return request(`/loan/${id}`);
}

export async function updateLoan(id: string, loan: LoanDTO): Promise<void> {
  return request(`/loan/${id}`, {
    method: 'PUT',
    body: JSON.stringify(loan),
  });
}

export async function patchLoan(id: string, fields: Partial<LoanDTO>): Promise<void> {
  return request(`/loan/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function returnLoan(id: string): Promise<void> {
  return request(`/loan/${id}/return`, { method: 'PATCH' });
}

export async function activateLoan(id: string): Promise<void> {
  return request(`/loan/${id}/activate`, { method: 'PATCH' });
}

export async function deleteLoan(id: string): Promise<void> {
  return request(`/loan/${id}`, { method: 'DELETE' });
}

// ==================== ME (current member) ====================

export async function getMyMember(): Promise<MemberDTO> {
  return request('/me');
}

export async function getMyLoans(params?: {
  loanState?: string;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PageResponse<LoanDTO>> {
  const query = buildQuery(params ?? {});
  return request(`/me/loan${query}`);
}

export async function getMyLoan(id: string): Promise<LoanDTO> {
  return request(`/me/loan/${id}`);
}

export async function createMyLoan(items: RequestedLoanItem[]): Promise<string | null> {
  return createRequest('/me/loan', items);
}
