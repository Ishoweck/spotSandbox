const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

async function fetcher<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    // Tell Next.js to cache this response and revalidate after 60s (ISR pattern)
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  return json;
}

// --- Categories ---
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon: string;
  parent: string | null;
  level: number;
  isActive: boolean;
  order: number;
  productCount: number;
}

export async function getCategories() {
  return fetcher<{ success: boolean; data: Category[] }>("/categories");
}

export async function getCategoryTree() {
  return fetcher<{ success: boolean; data: Category[] }>("/categories/tree");
}

// --- Products ---
// Both id and _id exist because different endpoints return different shapes
export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription: string;
  vendor: string | { _id: string; businessName: string; businessLogo: string };
  category: string | { _id: string; name: string; slug: string };
  productType: "physical" | "digital";
  price: number;
  compareAtPrice: number;
  images: string[];
  status: string;
  isFlashSale: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  totalSales: number;
  discountPercentage: number;
  inStock: boolean;
  createdAt: string;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function getProducts(params?: string) {
  return fetcher<ProductsResponse>(`/products${params ? `?${params}` : ""}`);
}

export async function getNewArrivals(limit = 10) {
  return fetcher<ProductsResponse>(`/products/new-arrivals?limit=${limit}`);
}

export async function getRecommended(limit = 5) {
  return fetcher<ProductsResponse>(`/products/recommended?limit=${limit}`);
}

export async function getFlashSales(limit = 5) {
  return fetcher<ProductsResponse>(`/products/flash-sales?limit=${limit}`);
}

export async function getTrending(limit = 5) {
  return fetcher<ProductsResponse>(`/products/trending?limit=${limit}`);
}

export async function getFeatured(limit = 5) {
  return fetcher<ProductsResponse>(`/products/featured?limit=${limit}`);
}

export async function getProductsByCategory(categoryId: string, limit = 10) {
  return fetcher<ProductsResponse>(`/products/category/${categoryId}?limit=${limit}`);
}

// --- Vendors / Shops ---
// Shape returned by GET /vendor/top
export interface VendorProfile {
  id: string;
  _id?: string;
  name: string;
  description: string;
  image: string;
  userAvatar: string;
  coverImage: string;
  location: string;
  businessAddress?: { city?: string; state?: string; country?: string; street?: string };
  rating: number;
  reviews: number;
  totalSales: number;
  productCount: number;
  verified: boolean;
  isPremium: boolean;
  followers: number;
  isFollowing: boolean;
}

export async function getTopVendors() {
  return fetcher<{ success: boolean; data: VendorProfile[] }>("/vendor/top");
}

export async function getPublicVendor(vendorId: string) {
  return fetcher<{ success: boolean; data: VendorProfile }>(`/vendor/public/${vendorId}`);
}

// --- Search ---
export async function searchProducts(query: string) {
  return fetcher<ProductsResponse>(`/products/search?q=${encodeURIComponent(query)}`);
}

export async function getSearchSuggestions(query: string) {
  return fetcher<{ success: boolean; data: string[] }>(`/search/suggestions?q=${encodeURIComponent(query)}`);
}
