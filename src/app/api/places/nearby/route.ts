import { NextRequest, NextResponse } from 'next/server';

// 보안: API 키는 서버사이드에서만 사용 (NEXT_PUBLIC_ 이지만 Places API는 도메인 제한 가능)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const type = searchParams.get('type') || 'restaurant';
  const radius = searchParams.get('radius') || '1000';

  if (!lat || !lng) {
    return NextResponse.json({ error: '위치 정보가 필요합니다' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // 에러에 상세 정보 노출 금지 (보안)
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', radius);
    url.searchParams.set('type', type);
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } }); // 5분 캐시
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      // 내부 에러 메시지는 클라이언트에 노출 금지
      console.error('Places API error:', data.status);
      return NextResponse.json({ error: '장소 검색 실패', results: [] }, { status: 502 });
    }

    return NextResponse.json({ results: data.results || [], status: data.status });
  } catch {
    return NextResponse.json({ error: '서버 오류', results: [] }, { status: 500 });
  }
}
