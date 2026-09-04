import { NextResponse } from 'next/server';
import { crawlChannels } from '@/lib/crawler/mockCrawler';
import { saveEvents } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const { secretKey, channels, yearMonth } = await req.json();

    const adminKey = process.env.ADMIN_SECRET_KEY || 'admin1234';
    if (secretKey !== adminKey) {
      return NextResponse.json({ message: '인증 실패: 올바른 관리자 키가 아닙니다.' }, { status: 401 });
    }

    if (!channels || channels.length === 0) {
      return NextResponse.json({ message: '선택된 채널이 없습니다.' }, { status: 400 });
    }

    const ym = yearMonth || '2026-09';
    const scraped = await crawlChannels(channels, ym);
    const updated = await saveEvents(scraped);

    return NextResponse.json({
      success: true,
      message: `${scraped.length}개 프로모션 데이터 수집 및 data/events.json 저장 완료`,
      totalCount: updated.length,
      saved: scraped,
    });
  } catch {
    return NextResponse.json({ message: '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
