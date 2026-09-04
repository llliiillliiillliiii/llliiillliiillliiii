import { CardEvent } from '../storage';
import { parseToManwon } from '../parser';

const MOCK_TARGETS: Record<string, { company: string; card: string; minSpend: string; minReward: string; maxSpend: string; maxReward: string; notes: string }[]> = {
  카드고릴라: [
    { company: '신한카드', card: '신한카드 플리', minSpend: '100,000원', minReward: '10만원', maxSpend: '150,000원', maxReward: '14.5만원', notes: '온라인 신청 전용' },
    { company: '현대카드', card: '현대카드 ZERO Edition3', minSpend: '120,000원', minReward: '11만원', maxSpend: '180,000원', maxReward: '16.5만원', notes: '애플페이 등록 우대' },
  ],
  네이버페이: [
    { company: '삼성카드', card: '삼성 iD HIT 카드', minSpend: '120,000원', minReward: '12만원', maxSpend: '175,000원', maxReward: '16.0만원', notes: '네이버페이 결제 연계' },
    { company: '하나카드', card: '하나 내맘대로 쁨', minSpend: '100,000원', minReward: '10만원', maxSpend: '150,000원', maxReward: '13.5만원', notes: '간편결제 실적 인정' },
  ],
  카카오페이: [
    { company: 'KB국민카드', card: 'KB국민 Easy All', minSpend: '100,000원', minReward: '10만원', maxSpend: '160,000원', maxReward: '15.0만원', notes: '카카오페이 머니 적립' },
  ],
  케이뱅크: [
    { company: '롯데카드', card: 'LOCA 100', minSpend: '100,000원', minReward: '10만원', maxSpend: '140,000원', maxReward: '13.0만원', notes: '케이뱅크 계좌 자동이체' },
  ],
  카카오뱅크: [
    { company: '우리카드', card: '카카오뱅크 우리카드 V2', minSpend: '100,000원', minReward: '10만원', maxSpend: '150,000원', maxReward: '14.5만원', notes: '카뱅 제휴 프로모션' },
  ],
  뱅크샐러드: [
    { company: '신한카드', card: '신한카드 Deep Dream Platinum+', minSpend: '150,000원', minReward: '13만원', maxSpend: '200,000원', maxReward: '18.0만원', notes: '뱅샐 단독 제휴' },
  ],
};

export async function crawlChannels(channels: string[], yearMonth: string): Promise<CardEvent[]> {
  const results: CardEvent[] = [];

  for (const ch of channels) {
    const pool = MOCK_TARGETS[ch] || [];
    pool.forEach((item, index) => {
      results.push({
        id: `${yearMonth}-${item.company}-${ch}-${index + 1}`.replace(/\s+/g, ''),
        year_month: yearMonth,
        card_company: item.company,
        channel: ch,
        card_name: item.card,
        min_spend: parseToManwon(item.minSpend),
        min_reward: parseToManwon(item.minReward),
        max_spend: parseToManwon(item.maxSpend),
        max_reward: parseToManwon(item.maxReward),
        notes: item.notes,
      });
    });
  }

  return results;
}
