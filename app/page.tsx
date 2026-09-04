'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatManwon } from '@/lib/parser';
import { CardEvent } from '@/lib/storage';

const ALL_CHANNELS = ['네이버페이', '카카오페이', '케이뱅크', '카카오뱅크', '카드고릴라', '뱅크샐러드'];
const ALL_COMPANIES = ['신한카드', '삼성카드', 'KB국민카드', '현대카드', '롯데카드', '우리카드', '하나카드'];

export default function DashboardPage() {
  const [events, setEvents] = useState<CardEvent[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [selectedChannel, setSelectedChannel] = useState<string>('전체');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data: CardEvent[]) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(events.map((e) => e.year_month))).sort().reverse();
    return months.length > 0 ? months : ['2026-09', '2026-08', '2026-07'];
  }, [events]);

  const toggleCompany = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company]
    );
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchMonth = selectedMonth === '전체' || e.year_month === selectedMonth;
      const matchChannel = selectedChannel === '전체' || e.channel === selectedChannel;
      const matchCompany =
        selectedCompanies.length === 0 || selectedCompanies.includes(e.card_company);
      return matchMonth && matchChannel && matchCompany;
    });
  }, [events, selectedMonth, selectedChannel, selectedCompanies]);

  const chartData = useMemo(() => {
    const group: Record<string, { minRewardSum: number; maxRewardSum: number; count: number }> = {};

    filteredEvents.forEach((e) => {
      if (!group[e.card_company]) {
        group[e.card_company] = { minRewardSum: 0, maxRewardSum: 0, count: 0 };
      }
      group[e.card_company].minRewardSum += e.min_reward;
      group[e.card_company].maxRewardSum += e.max_reward;
      group[e.card_company].count += 1;
    });

    return Object.entries(group).map(([company, stat]) => ({
      company,
      minReward: Number((stat.minRewardSum / stat.count).toFixed(1)),
      maxReward: Number((stat.maxRewardSum / stat.count).toFixed(1)),
    }));
  }, [filteredEvents]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              신규 카드 발급 이벤트 대시보드
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              월별·채널별·카드사별 조건(최소/최대) 비교 및 캐시백 혜택 현황 (단위: 만원)
            </p>
          </div>
          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            관리자 콘솔
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                기준 연월
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체 월 보기</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                유입 채널
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="전체">전체 채널</option>
                {ALL_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                카드사 선택 (다중)
              </label>
              {selectedCompanies.length > 0 && (
                <button
                  onClick={() => setSelectedCompanies([])}
                  className="text-xs text-blue-600 hover:underline"
                >
                  선택 초기화
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_COMPANIES.map((company) => {
                const active = selectedCompanies.includes(company);
                return (
                  <button
                    key={company}
                    onClick={() => toggleCompany(company)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {company}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">카드사별 혜택 비교 차트</h2>
            <p className="text-xs text-slate-500">
              선택 조건 기준 최소 조건 혜택 vs 최대 조건 혜택 평균값
            </p>
          </div>

          {loading ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
              데이터 로딩 중...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-sm">
              조건에 맞는 이벤트 데이터가 없습니다.
            </div>
          ) : (
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="company" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `${Number(val).toFixed(1)}만`}
                  />
                  <Tooltip
                    formatter={(val: number) => [formatManwon(val)]}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10 }} />
                  <Bar dataKey="minReward" name="최소 조건 혜택" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxReward" name="최대 조건 혜택" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">이벤트 상세 목록</h2>
              <p className="text-xs text-slate-500 mt-0.5">총 {filteredEvents.length}건 검색됨</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">기준연월</th>
                  <th className="px-5 py-3">카드사</th>
                  <th className="px-5 py-3">유입채널</th>
                  <th className="px-5 py-3">카드명</th>
                  <th className="px-5 py-3 text-right">최소조건(실적/혜택)</th>
                  <th className="px-5 py-3 text-right">최대조건(실적/혜택)</th>
                  <th className="px-5 py-3">비고</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                      표시할 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-600">{item.year_month}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900">{item.card_company}</td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700">
                          {item.channel}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-900 font-medium">{item.card_name}</td>
                      <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                        {formatManwon(item.min_spend)} /{' '}
                        <span className="text-blue-600 font-semibold">{formatManwon(item.min_reward)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-slate-600">
                        {formatManwon(item.max_spend)} /{' '}
                        <span className="text-blue-600 font-bold">{formatManwon(item.max_reward)}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
