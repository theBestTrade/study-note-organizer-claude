const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function getDateParts(dateStr: string): { month: number; day: number; weekday: string } {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: WEEKDAYS[d.getDay()],
  };
}

export function formatDateDisplay(dateStr: string): string {
  const { month, day, weekday } = getDateParts(dateStr);
  return `${month}월 ${day}일(${weekday})`;
}

export function toYYMMDD(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export function extractKeywords(content: string): [string, string] {
  const match = content.match(/\[핵심 키워드\]\s*\n([^\n,]+),\s*([^\n]+)/);
  if (match) {
    const k1 = match[1].trim().replace(/[\s\W]+/g, '');
    const k2 = match[2].trim().replace(/[\s\W]+/g, '');
    return [k1 || '정리', k2 || '수업'];
  }
  return ['정리', '수업'];
}

export function removeKeywordsLine(content: string): string {
  return content.replace(/\n?\[핵심 키워드\]\n[^\n]+\n?/, '').trim();
}

export function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
