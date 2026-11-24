import { describe, expect, it } from 'vitest';
import { buildState, completionsToDone, historyStart, isStoragePath, itemToRow, photoPath, rowToItem, type CircleRow, type CompletionRow, type ItemRow } from './remote';

const row: ItemRow = {
  id: 'i1',
  circle_id: 'c1',
  time: '08:30',
  title: 'Ochtendpillen',
  kind: 'medicijn',
  date: null,
  photo: null,
  important: true,
  who: null,
  relation: null,
};

describe('completionsToDone', () => {
  it('groups completions per day and item', () => {
    const rows: CompletionRow[] = [
      { circle_id: 'c1', item_id: 'a', date_key: '2026-11-24', done_at: 1000 },
      { circle_id: 'c1', item_id: 'b', date_key: '2026-11-24', done_at: '2000' }, // bigint can arrive as a string
      { circle_id: 'c1', item_id: 'a', date_key: '2026-11-23', done_at: 500 },
    ];
    expect(completionsToDone(rows)).toEqual({
      '2026-11-24': { a: 1000, b: 2000 },
      '2026-11-23': { a: 500 },
    });
  });

  it('gives an empty map for no rows', () => {
    expect(completionsToDone([])).toEqual({});
  });
});

describe('rowToItem', () => {
  it('turns nulls into missing fields', () => {
    expect(rowToItem(row)).toEqual({ id: 'i1', time: '08:30', title: 'Ochtendpillen', kind: 'medicijn', important: true });
  });

  it('keeps date and uses the signed url for a stored photo', () => {
    const r: ItemRow = { ...row, kind: 'bezoek', date: '2026-11-25', photo: 'c1/i1.jpg', important: false };
    expect(rowToItem(r, 'https://signed/x')).toEqual({ id: 'i1', time: '08:30', title: 'Ochtendpillen', kind: 'bezoek', date: '2026-11-25', photo: 'https://signed/x' });
  });

  it('keeps who and relation of a visitor', () => {
    const r: ItemRow = { ...row, kind: 'bezoek', important: false, who: 'Tom', relation: 'je zoon' };
    expect(rowToItem(r)).toEqual({ id: 'i1', time: '08:30', title: 'Ochtendpillen', kind: 'bezoek', who: 'Tom', relation: 'je zoon' });
  });

  it('shows no photo while the signed url is missing', () => {
    expect(rowToItem({ ...row, photo: 'c1/i1.jpg' }).photo).toBeUndefined();
  });
});

describe('itemToRow', () => {
  it('maps an item to a row with explicit nulls', () => {
    const item = rowToItem(row);
    expect(itemToRow(item, 'c1')).toEqual(row);
    expect(itemToRow({ ...item, important: undefined, date: '2026-11-25' }, 'c1', 'c1/i1.jpg')).toMatchObject({
      date: '2026-11-25',
      photo: 'c1/i1.jpg',
      important: false,
    });
  });
});

describe('who and relation round trip', () => {
  it('writes them to the row and back, empty ones as null', () => {
    const visit = { id: 'i2', time: '10:00', title: 'Tom komt', kind: 'bezoek' as const, who: 'Tom', relation: 'je zoon' };
    const r = itemToRow(visit, 'c1');
    expect(r).toMatchObject({ who: 'Tom', relation: 'je zoon' });
    expect(rowToItem(r)).toEqual(visit);
    expect(itemToRow({ ...visit, who: undefined, relation: undefined }, 'c1')).toMatchObject({ who: null, relation: null });
  });
});

describe('photoPath', () => {
  it('is the circle folder plus the item id', () => {
    expect(photoPath('c1', 'i1')).toBe('c1/i1.jpg');
  });
});

describe('isStoragePath', () => {
  it('tells storage paths from data and http urls', () => {
    expect(isStoragePath('c1/i1.jpg')).toBe(true);
    expect(isStoragePath('data:image/jpeg;base64,AAA')).toBe(false);
    expect(isStoragePath('https://x/y.jpg')).toBe(false);
    expect(isStoragePath(null)).toBe(false);
  });
});

describe('buildState', () => {
  const circle: CircleRow = { id: 'c1', name: 'Maria', pair_code: 'ABC234', demo_offset: 0 };

  it('builds the State the UI uses', () => {
    const s = buildState(circle, [row], [{ circle_id: 'c1', item_id: 'i1', date_key: '2026-11-24', done_at: 1000 }]);
    expect(s.name).toBe('Maria');
    expect(s.items).toHaveLength(1);
    expect(s.done).toEqual({ '2026-11-24': { i1: 1000 } });
    expect(s.offset).toBeUndefined();
  });

  it('carries the demo offset and signed photo urls', () => {
    const withPhoto: ItemRow = { ...row, photo: 'c1/i1.jpg' };
    const s = buildState({ ...circle, demo_offset: '3600000' }, [withPhoto], [], { 'c1/i1.jpg': 'https://signed/x' });
    expect(s.offset).toBe(3_600_000);
    expect(s.items[0].photo).toBe('https://signed/x');
  });
});

describe('historyStart', () => {
  it('is a day key about a week back', () => {
    const now = new Date(2026, 10, 24, 12, 0).getTime();
    expect(historyStart(now)).toBe('2026-11-16');
  });
});
