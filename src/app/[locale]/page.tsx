'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import PlaceCard from '@/components/PlaceCard';
import type { PlaceResult } from '@/lib/places';

const LOCALES = [
  { code: 'ko', label: '🇰🇷 한국어' },
  { code: 'en', label: '🇺🇸 English' },
  { code: 'ja', label: '🇯🇵 日本語' },
  { code: 'zh', label: '🇨🇳 中文' },
  { code: 'es', label: '🇪🇸 Español' },
  { code: 'fr', label: '🇫🇷 Français' },
  { code: 'de', label: '🇩🇪 Deutsch' },
  { code: 'pt', label: '🇧🇷 Português' },
  { code: 'hi', label: '🇮🇳 हिन्दी' },
  { code: 'id', label: '🇮🇩 Indonesia' },
  { code: 'th', label: '🇹🇭 ไทย' },
  { code: 'vi', label: '🇻🇳 Tiếng Việt' },
];

const CATEGORIES = [
  { key: 'restaurant', ko: '맛집', en: 'Restaurant', type: 'restaurant' },
  { key: 'cafe', ko: '카페', en: 'Cafe', type: 'cafe' },
  { key: 'bar', ko: '술집', en: 'Bar', type: 'bar' },
  { key: 'hotel', ko: '숙소', en: 'Hotel', type: 'lodging' },
  { key: 'attraction', ko: '관광지', en: 'Attraction', type: 'tourist_attraction' },
  { key: 'shopping', ko: '쇼핑', en: 'Shopping', type: 'shopping_mall' },
  { key: 'beauty', ko: '미용', en: 'Beauty', type: 'beauty_salon' },
  { key: 'hospital', ko: '병원', en: 'Hospital', type: 'hospital' },
];

interface Location { lat: number; lng: number; }
type SortType = 'reviews' | 'rating';

export default function HomePage() {
  const locale = useLocale();
  const router = useRouter();

  const [location, setLocation] = useState<Location | null>(null);
  const [gpsError, setGpsError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [sortType, setSortType] = useState<SortType>('reviews');
  const [districtPlaces, setDistrictPlaces] = useState<PlaceResult[]>([]);
  const [cityPlaces, setCityPlaces] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sortPlaces = (places: PlaceResult[], sort: SortType) =>
    [...places].sort((a, b) =>
      sort === 'reviews'
        ? b.user_ratings_total - a.user_ratings_total
        : b.rating - a.rating
    );

  const fetchPlaces = useCallback(async (loc: Location, category: typeof CATEGORIES[0]) => {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/places/nearby?lat=${loc.lat}&lng=${loc.lng}&type=${category.type}&radius=1000`),
        fetch(`/api/places/nearby?lat=${loc.lat}&lng=${loc.lng}&type=${category.type}&radius=5000`),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setDistrictPlaces(d1.results || []);
      setCityPlaces(d2.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('GPS를 지원하지 않는 브라우저예요');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(loc);
        setGpsLoading(false);
        fetchPlaces(loc, selectedCategory);
      },
      () => {
        setGpsError('위치 권한을 허용해주세요');
        setGpsLoading(false);
      }
    );
  };

  useEffect(() => {
    if (location) fetchPlaces(location, selectedCategory);
  }, [selectedCategory, location, fetchPlaces]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    const ll = location ? `&lat=${location.lat}&lng=${location.lng}` : '';
    router.push(`/${locale}/results?q=${q}${ll}`);
  };

  const catLabel = (cat: typeof CATEGORIES[0]) => locale === 'ko' ? cat.ko : cat.en;

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat);
    setDrawerOpen(false);
  };

  const displayDistrict = sortPlaces(districtPlaces, sortType).slice(0, 6);
  const displayCity = sortPlaces(
    cityPlaces.filter(p => !districtPlaces.find(d => d.place_id === p.place_id)),
    sortType
  ).slice(0, 6);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* 모바일 드로어 오버레이 */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* 모바일 드로어 */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Categories</span>
          <button onClick={() => setDrawerOpen(false)} className="text-gray-300 hover:text-gray-600 transition text-lg">✕</button>
        </div>
        <nav className="py-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => handleCategorySelect(cat)}
              className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                selectedCategory.key === cat.key
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {catLabel(cat)}
            </button>
          ))}
        </nav>
      </aside>

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {/* 모바일 햄버거 */}
          <button className="md:hidden p-1 text-gray-400 hover:text-gray-700 transition" onClick={() => setDrawerOpen(true)} aria-label="메뉴">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* 로고 */}
          <div className="flex items-center gap-2.5">
            <svg viewBox="-52 -24 104 48" className="w-9 h-6">
              <defs>
                <linearGradient id="hGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1a1a1a" />
                  <stop offset="50%" stopColor="#555" />
                  <stop offset="100%" stopColor="#1a1a1a" />
                </linearGradient>
              </defs>
              <path d="M 0,0 C -5,17 -42,17 -42,0 C -42,-17 -5,-17 0,0"
                fill="none" stroke="url(#hGrad)" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
              <rect x="-10" y="-10" width="20" height="20" fill="white" />
              <path d="M 0,0 C 5,-17 42,-17 42,0 C 42,17 5,17 0,0"
                fill="none" stroke="url(#hGrad)" strokeWidth="7" strokeLinecap="round" />
              <circle cx="0" cy="0" r="2" fill="#333" opacity="0.6" />
            </svg>
            <span className="font-bold text-base tracking-tight text-gray-900">ALL Review</span>
          </div>
        </div>

        {/* 언어 선택 */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition"
          >
            {LOCALES.find(l => l.code === locale)?.label.split(' ')[0]}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 min-w-[150px] max-h-72 overflow-y-auto">
              {LOCALES.map(l => (
                <button
                  key={l.code}
                  onClick={() => { router.push(`/${l.code}`); setShowLangMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-50 ${locale === l.code ? 'font-semibold text-gray-900' : 'text-gray-500'}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* 데스크탑 사이드바 */}
        <aside className="hidden md:flex flex-col w-48 border-r border-gray-100 sticky top-[61px] h-[calc(100vh-61px)] py-6">
          <p className="text-xs text-gray-300 uppercase tracking-widest px-6 mb-3">Categories</p>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat)}
              className={`text-left px-6 py-2.5 text-sm transition-colors ${
                selectedCategory.key === cat.key
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              {catLabel(cat)}
            </button>
          ))}
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 px-5 md:px-10 py-8 max-w-5xl">

          {/* 검색창 */}
          <form onSubmit={handleSearch} className="mb-10">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="장소, 음식, 지역 검색..."
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-400 text-sm text-gray-800 placeholder:text-gray-300 transition-all"
              />
              {searchQuery && (
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-gray-700 transition">
                  검색
                </button>
              )}
            </div>
          </form>

          {/* GPS CTA */}
          {!location && (
            <div className="mb-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">전 세계 어디서든</h1>
              <p className="text-gray-400 text-sm mb-6">GPS를 켜면 지금 있는 곳 주변 장소를 바로 볼 수 있어요</p>
              {gpsError && <p className="text-red-400 text-sm mb-4">{gpsError}</p>}
              <button
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl hover:bg-gray-700 transition disabled:opacity-40"
              >
                {gpsLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> 위치 찾는 중</>
                ) : (
                  <>내 주변 탐색하기</>
                )}
              </button>
            </div>
          )}

          {/* 위치 있을 때 */}
          {location && (
            <>
              {/* 정렬 탭 */}
              <div className="flex items-center gap-1 mb-8 border-b border-gray-100 pb-0">
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

              {/* 로딩 */}
              {loading && (
                <div className="flex items-center gap-2 text-gray-300 py-12">
                  <span className="w-4 h-4 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
                  <span className="text-sm">주변 장소 찾는 중...</span>
                </div>
              )}

              {/* 내 동네 섹션 */}
              {!loading && (
                <>
                  <section className="mb-12">
                    <div className="flex items-baseline justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">내 동네 {catLabel(selectedCategory)}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">반경 1km</p>
                      </div>
                    </div>
                    {displayDistrict.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-7">
                        {displayDistrict.map(place => (
                          <PlaceCard
                            key={place.place_id}
                            place={place}
                            onClick={() => router.push(`/${locale}/results?q=${encodeURIComponent(place.name)}&lat=${location.lat}&lng=${location.lng}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300 py-6">반경 1km 내 {catLabel(selectedCategory)} 없음</p>
                    )}
                  </section>

                  <section className="mb-12">
                    <div className="flex items-baseline justify-between mb-5">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">내 도시 {catLabel(selectedCategory)}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">반경 5km</p>
                      </div>
                    </div>
                    {displayCity.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-7">
                        {displayCity.map(place => (
                          <PlaceCard
                            key={place.place_id}
                            place={place}
                            onClick={() => router.push(`/${locale}/results?q=${encodeURIComponent(place.name)}&lat=${location.lat}&lng=${location.lng}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300 py-6">반경 5km 내 {catLabel(selectedCategory)} 없음</p>
                    )}
                  </section>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
