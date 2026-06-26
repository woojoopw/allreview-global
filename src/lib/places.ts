// Google Places API 유틸리티
// API 키는 환경변수에서만 가져옴 — 절대 하드코딩 금지

export const CATEGORY_MAP: Record<string, string> = {
  restaurant: 'restaurant',
  cafe: 'cafe',
  bar: 'bar',
  hotel: 'lodging',
  attraction: 'tourist_attraction',
  shopping: 'shopping_mall',
  beauty: 'beauty_salon',
  hospital: 'hospital',
};

export interface PlaceResult {
  place_id: string;
  name: string;
  rating: number;
  user_ratings_total: number;
  vicinity: string;
  types: string[];
  photos?: { photo_reference: string }[];
  geometry: {
    location: { lat: number; lng: number };
  };
}

export interface PlacesApiResponse {
  results: PlaceResult[];
  status: string;
  next_page_token?: string;
}

// 장소 사진 URL 반환
export function getPhotoUrl(photoReference: string, maxWidth = 400): string {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

// 평점 별 표시 (0~5)
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
