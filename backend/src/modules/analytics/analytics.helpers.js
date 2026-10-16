
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PERIOD_PRESETS = {
  '7d':  { days: 7,  group: 'day' },
  '30d': { days: 30, group: 'day' },
  '90d': { days: 90, group: 'week' },
};

function parsePeriod(period) {
  const preset = PERIOD_PRESETS[period];
  if (!preset) throw new Error(`Unknown period: ${period}`);

  const now = new Date();
  const to = endOfDay(now);

  const from = startOfDay(
    new Date(now.getTime() - (preset.days - 1) * MS_PER_DAY)
  );

  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = startOfDay(
    new Date(previousTo.getTime() - (preset.days - 1) * MS_PER_DAY)
  );

  return {
    from,
    to,
    group: preset.group,
    previousFrom,
    previousTo: endOfDay(previousTo),
  };
}

function parseRange(fromStr, toStr) {
  if (!fromStr || !toStr) throw new Error('from and to are required');

  const from = startOfDay(new Date(fromStr));
  const to = endOfDay(new Date(toStr));

  if (Number.isNaN(from.getTime())) throw new Error('Invalid "from" date');
  if (Number.isNaN(to.getTime())) throw new Error('Invalid "to" date');
  if (from > to) throw new Error('"from" must be before "to"');

  const spanDays = Math.floor((to - from) / MS_PER_DAY) + 1;

  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = startOfDay(
    new Date(previousTo.getTime() - (spanDays - 1) * MS_PER_DAY)
  );

  return {
    from,
    to,
    spanDays,
    group: pickGrouping(spanDays),
    previousFrom,
    previousTo: endOfDay(previousTo),
  };
}

function pickGrouping(spanDays) {
  if (spanDays <= 31) return 'day';
  if (spanDays <= 120) return 'week';
  return 'month';
}

// Always return a string, so bucket keys are consistent between SQL and JS.
function bucketExpression(group, column = 'created_at') {
  switch (group) {
    case 'day':
      return `DATE_FORMAT(${column}, '%Y-%m-%d')`;
    case 'week':
      return `DATE_FORMAT(${column}, '%x-%v')`;
    case 'month':
      return `DATE_FORMAT(${column}, '%Y-%m')`;
    default:
      throw new Error(`Unknown group: ${group}`);
  }
}

function toMysqlDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
         `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function delta(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) {
    return { current: c, previous: p, pct: c > 0 ? null : 0, direction: c > 0 ? 'up' : 'flat' };
  }
  const pct = Math.round(((c - p) / p) * 1000) / 10;
  return {
    current: c,
    previous: p,
    pct,
    direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  };
}

const REVENUE_STATUSES = ['pending', 'confirmed', 'shipped', 'completed'];
// ─── Zero-fill helpers ─────────────────────────────────

function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

function bucketKey(date, group) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  if (group === 'day') return `${y}-${m}-${d}`;
  if (group === 'month') return `${y}-${m}`;
  return isoWeekKey(date);
}

function enumerateBuckets(from, to, group) {
  const keys = [];
  const seen = new Set();
  const cursor = new Date(from);
  const end = new Date(to);
  cursor.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const key = bucketKey(cursor, group);
    if (!seen.has(key)) {
      seen.add(key);
      keys.push(key);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

// Takes sparse points and returns exactly one point per bucket in range.
// `zeroShape` is the shape of an empty point, minus `date`.
function fillSeries(from, to, group, sparse, zeroShape) {
  const keys = enumerateBuckets(from, to, group);
  const byKey = new Map(sparse.map((p) => [p.date, p]));
  return keys.map((k) => byKey.get(k) || { date: k, ...zeroShape });
}

module.exports = {
  parsePeriod,
  parseRange,
  pickGrouping,
  bucketExpression,
  toMysqlDateTime,
  startOfDay,
  endOfDay,
  delta,
  fillSeries,
  enumerateBuckets,
  REVENUE_STATUSES,
  PERIOD_PRESETS,
};