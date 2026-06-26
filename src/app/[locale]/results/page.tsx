'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import PlaceCard from '@/components/PlaceCard';
import type { PlaceResult } from '@/lib/places';

type SortType = 'reviews' | 'rating';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();

  const q = searchParams.get('q') || '';
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState<SortType>('reviews');
  const [searchInput, setSearchInput] = useState(q);

  const fetchResults = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      let url = `/api/places/search?q=${encodeURIComponent(query)}`;
      if (lat && lng) url += `&lat=${lat}&lng=${lng}`;
      const res = await fetch(url);
      const data = await res.json();
      setPlaces(data.results || []);
    } catch (e) {
      console.error(e);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  }, [lat, lng]);

  useEffect(() => { fetchResults(q); }, [q, fetchResults]);

  const sorted = [...places].sort((a, b) =>
    sortType === 'reviews'
      ? b.user_ratings_total - a.user_ratings_total
      : b.rating - a.rating
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const newQ = encodeURIComponent(searchInput.trim());
    const ll = lat && lng ? `&lat=${lat}&lng=${lng}` : '';
    router.push(`/${locale}/results?q=${newQ}${ll}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="border-b border-gray-100 px-5 py-4 sticky top-0 bg-white z-30">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.push(`/${locale}`)} className="text-gray-300 hover:text-gray-600 transition flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 5L7.5 10l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <form onSubmit={handleSearch} className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="검색..."
              className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 focus:outline-none focus:border-gray-300 text-sm text-gray-800 placeholder:text-gray-300 transition-all"
            />
          </form>

          <span className="text-xs font-bold text-gray-900 flex-shrink-0">ALL Review</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* 검색 결과 헤더 */}
        {!loading && places.length > 0 && (
          <div className="mb-8">
            <h1 className="text-xl font-bold text-gray-900">{q}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{places.length}개 장소</p>

            {/* 정렬 탭 */}
            <div className="flex items-center gap-1 mt-5 border-b border-gray-100 pb-0">
              {(['reviews', 'rating'] as SortType[]).map(s => (
                <button
                  key={s}
                  onClick={() => setSortType(s)}
                  className={`pb-3 px-1 mr-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    sortType === s ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {s === 'reviews' ? '리뷰 많은 순' : '평점 높은 순'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 로딩 */}
        {loading && (
          <div className="flex items-center gap-2 text-gray-300 py-16">
            <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
            <span className="text-sm">검색 중...</span>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !places.length && q && (
          <div className="py-20">
            <p className="text-gray-900 font-semibold mb-1">&ldquo;{q}&rdquo; 결과 없음</p>
            <p className="text-sm text-gray-400">다른 키워드로 검색해보세요</p>
          </div>
        )}

        {/* 결과 그리드 */}
        {!loading && sorted.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-7">
            {sorted.map(place => (
              <PlaceCard key={place.place_id} place={place} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
