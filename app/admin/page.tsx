'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatManwon } from '@/lib/parser';
import { CardEvent } from '@/lib/storage';

const CHANNELS = ['네이버페이', '카카오페이', '케이뱅크', '카카오뱅크', '카드고릴라', '뱅크샐러드'];

export default function AdminPage() {
  const [secretKey, setSecretKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(CHANNELS);
  const [yearMonth, setYearMonth] = useState('2026-09');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [crawledData, setCrawledData] = useState<CardEvent[]>([]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secretKey.trim().length > 0) {
      setIsAuthenticated(true);
    }
  };

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const runCrawler = async () => {
    setLoading(true);
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] 크롤링 요청 시작...`, ...prev]);

    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey,
          channels: selectedChannels,
          yearMonth,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '크롤링 실패');
      }

      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 성공: ${data.message}`,
        ...prev,
      ]);
      setCrawledData(data.saved || []);
    } catch (err: any) {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 실패: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-xl border border-slate-200 shadow-md w-full max-w-sm space-y-4"
        >
          <h1 className="text-xl font-bold text-slate-900">관리자 인증</h1>
          <p className="text-xs text-slate-500">
            환경 변수(ADMIN_SECRET_KEY)로 설정된 비밀키를 입력하세요.
          </p>
          <input
            type="password"
            placeholder="비밀키 (기본: admin1234)"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            대시보드 로그인
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">프로모션 크롤링 관리자 콘솔</h1>
            <p className="text-xs text-slate-500 mt-1">
              각 금융 제휴 채널의 최신 이벤트를 수집하여 data/events.json에 저장합니다.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 underline"
          >
            메인 대시보드로 돌아가기
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                수집 대상 기준 연월
              </label>
              <input
                type="text"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                placeholder="2026-09"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                대상 채널 선택
              </label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.map((ch) => {
                  const active = selectedChannels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => toggleChannel(ch)}
                      className={`px-3 py-1 rounded text-xs font-medium border ${
                        active
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            onClick={runCrawler}
            disabled={loading || selectedChannels.length === 0}
            className={`w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
          >
            {loading ? '크롤링 데이터 수집 및 정규화 진행 중...' : '데이터 수집 시작 (모의 실행)'}
          </button>
        </div>

        <div className="bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs shadow-inner">
          <div className="text-slate-400 mb-2 font-semibold uppercase tracking-wider">
            Execution Logs
          </div>
          <div className="space-y-1 h-32 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-slate-500">대기 중... 작업을 시작해 주세요.</div>
            ) : (
              logs.map((log, i) => <div key={i}>{log}</div>)
            )}
          </div>
        </div>

        {crawledData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 font-bold text-slate-800 text-sm">
              최근 크롤링 반영 데이터 ({crawledData.length}건)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="p-3">카드사</th>
                    <th className="p-3">채널</th>
                    <th className="p-3">카드명</th>
                    <th className="p-3 text-right">최소조건(실적/혜택)</th>
                    <th className="p-3 text-right">최대조건(실적/혜택)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {crawledData.map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold">{item.card_company}</td>
                      <td className="p-3">{item.channel}</td>
                      <td className="p-3">{item.card_name}</td>
                      <td className="p-3 text-right">
                        {formatManwon(item.min_spend)} / {formatManwon(item.min_reward)}
                      </td>
                      <td className="p-3 text-right font-semibold text-blue-600">
                        {formatManwon(item.max_spend)} / {formatManwon(item.max_reward)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
