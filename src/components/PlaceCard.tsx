'use client';

import { PlaceResult, getPhotoUrl } from '@/lib/places';

interface PlaceCardProps {
  place: PlaceResult;
  onClick?: () => void;
}

export default function PlaceCard({ place, onClick }: PlaceCardProps) {
  const photo = place.photos?.[0];
  const imageUrl = photo ? getPhotoUrl(photo.photo_reference, 400) : null;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* 이미지 */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 mb-3">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}

        {/* 평점 뱃지 */}
        {place.rating > 0 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1">
            <span className="text-yellow-400 text-xs">★</span>
            <span className="text-white text-xs font-semibold">{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* 텍스트 */}
      <div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors duration-200">
          {place.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{place.vicinity}</p>
        {place.user_ratings_total > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">
            리뷰 {place.user_ratings_total.toLocaleString()}개
          </p>
        )}
      </div>
    </div>
  );
}
