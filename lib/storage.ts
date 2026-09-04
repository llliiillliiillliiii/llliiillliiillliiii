import fs from 'fs/promises';
import path from 'path';

export interface CardEvent {
  id: string;
  year_month: string;
  card_company: string;
  channel: string;
  card_name: string;
  min_spend: number;
  min_reward: number;
  max_spend: number;
  max_reward: number;
  notes?: string;
}

const DATA_PATH = path.join(process.cwd(), 'data', 'events.json');

export async function getEvents(): Promise<CardEvent[]> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveEvents(newItems: CardEvent[]): Promise<CardEvent[]> {
  const current = await getEvents();
  const map = new Map<string, CardEvent>();

  current.forEach((item) => map.set(item.id, item));
  newItems.forEach((item) => map.set(item.id, item));

  const merged = Array.from(map.values());
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}
