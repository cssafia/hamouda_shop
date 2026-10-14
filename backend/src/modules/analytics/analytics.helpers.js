// Date-range parsing, grouping, and delta math for the analytics module.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const PERIOD_PRESETS = {
  '7d':  { days: 7,  group: 'day' },
  '30d': { days: 30, group: 'day' },
  '90d': { days: 90, group: 'week' },
};

/**
 * Convert a preset ("7d" | "30d" | "90d") into { from, to, group, previousFrom, previousTo }.
 * `to` is end-of-day today.
 */
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

/**
 * Convert explicit from/to date strings into a full range + previous range.
 * Accepts 'YYYY-MM-DD' or full ISO timestamps.
 * Auto-picks grouping based on the span (§4.3 of the spec).
 */
function parseRange(fromStr, toStr) {
  if (!fromStr || !toStr) throw new Error('from and to are required');

  const from = startOfDay(new Date(fromStr));
  const to = endOfDay(new Date(toStr));

  if (Number.isNaN(from.getTime())) throw new Error('Invalid "from" date');
  if (Number.isNaN(to.getTime())) throw new Error('Invalid "to" date');
  if (from > to) throw new Error('"from" must be before "to"');

  const spanDays = Math.floor((to - from) / MS_PER_DAY) + 1;

  // Previous period = same length, immediately before
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

/**
 * Auto-pick a grouping bucket from the span (§4.3).
 *   ≤ 31 days  → day
 *   ≤ 120 days → week
 *   > 120 days → month
 */
function pickGrouping(spanDays) {
  if (spanDays <= 31) return 'day';
  if (spanDays <= 120) return 'week';
  return 'month';
}

/**
 * Build the SQL expression that buckets `created_at` for a given grouping.
 * Never interpolate user input here — only ever our own constants.
 */
function bucketExpression(group, column = 'created_at') {
  switch (group) {
    case 'day':
      return `DATE(${column})`;
    case 'week':
      // %x = ISO year, %v = ISO week (01-53)
      return `DATE_FORMAT(${column}, '%x-%v')`;
    case 'month':
      return `DATE_FORMAT(${column}, '%Y-%m')`;
    default:
      throw new Error(`Unknown group: ${group}`);
  }
}

/** Format a Date as MySQL DATETIME ('YYYY-MM-DD HH:mm:ss'). */
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

/**
 * Compute the delta between two numbers and return a normalized object.
 * The frontend decides how to render it.
 */
function delta(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  if (p === 0) return { current: c, previous: p, pct: c > 0 ? null : 0, direction: c > 0 ? 'up' : 'flat' };
  const pct = Math.round(((c - p) / p) * 1000) / 10; // one decimal
  return {
    current: c,
    previous: p,
    pct,
    direction: pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat',
  };
}

/** Order statuses that count as "revenue" (excludes cancelled + returned). */
const REVENUE_STATUSES = ['pending', 'confirmed', 'shipped', 'completed'];

module.exports = {
  parsePeriod,
  parseRange,
  pickGrouping,
  bucketExpression,
  toMysqlDateTime,
  startOfDay,
  endOfDay,
  delta,
  REVENUE_STATUSES,
  PERIOD_PRESETS,
};