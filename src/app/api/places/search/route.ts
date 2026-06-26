import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!query) {
    return NextResponse.json({ error: '검색어가 필요합니다' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: '서버 설정 오류' }, { status: 500 });
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('key', apiKey);
    if (lat && lng) {
      url.searchParams.set('location', `${lat},${lng}`);
      url.searchParams.set('radius', '10000');
    }

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('Places Text Search error:', data.status);
      return NextResponse.json({ error: '검색 실패', results: [] }, { status: 502 });
    }

    return NextResponse.json({ results: data.results || [], status: data.status });
  } catch {
    return NextResponse.json({ error: '서버 오류', results: [] }, { status: 500 });
  }
}
