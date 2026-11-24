import { describe, expect, it } from 'vitest';
import { weatherTip, type Weather } from './weather';

const w = (over: Partial<Weather>): Weather => ({ temp: 15, sky: 'wolk', label: 'Bewolkt', precip: 0, ...over });

describe('weatherTip', () => {
  it('tells to wear a warm coat when it is cold', () => {
    expect(weatherTip(w({ temp: 5 }), 'ochtend')).toBe('Het is koud buiten. Neem je warme jas.');
  });

  it('tells to take an umbrella when it rains', () => {
    expect(weatherTip(w({ sky: 'regen', label: 'Regen' }), 'middag')).toBe('Het regent. Neem een paraplu mee.');
    expect(weatherTip(w({ precip: 0.4 }), 'middag')).toBe('Het regent. Neem een paraplu mee.');
  });

  it('tells to drink when it is hot', () => {
    expect(weatherTip(w({ temp: 28, sky: 'zon', label: 'Zonnig' }), 'middag')).toBe('Het is warm. Drink genoeg water.');
  });

  it('says nothing for ordinary weather, also on the edges', () => {
    expect(weatherTip(w({ temp: 15 }), 'ochtend')).toBeNull();
    expect(weatherTip(w({ temp: 8 }), 'ochtend')).toBeNull();
    expect(weatherTip(w({ temp: 25 }), 'middag')).toBeNull();
  });

  it('prefers the umbrella over the coat', () => {
    expect(weatherTip(w({ temp: 4, sky: 'regen', label: 'Regen' }), 'ochtend')).toBe('Het regent. Neem een paraplu mee.');
  });

  it('says nothing in the evening or at night, or without weather', () => {
    expect(weatherTip(w({ temp: 2 }), 'avond')).toBeNull();
    expect(weatherTip(w({ temp: 2 }), 'nacht')).toBeNull();
    expect(weatherTip(null, 'ochtend')).toBeNull();
  });
});
