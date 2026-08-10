import { describe, it, expect } from 'vitest';
import { convertAmountAndUnit } from './unitConverter';

describe('unitConverter utility', () => {
  // Dry conversions
  it('converts grams to ounces correctly', () => {
    const res = convertAmountAndUnit(100, 'g', 'imperial');
    expect(res.amount).toBeCloseTo(3.527, 2);
    expect(res.unit).toBe('oz');
  });

  it('converts ounces to grams correctly', () => {
    const res = convertAmountAndUnit(5, 'oz', 'metric');
    expect(res.amount).toBeCloseTo(141.75, 2);
    expect(res.unit).toBe('g');
  });

  // Liquid conversions
  it('converts milliliters to cups correctly', () => {
    const res = convertAmountAndUnit(240, 'ml', 'imperial');
    expect(res.amount).toBeCloseTo(1.014, 2);
    expect(res.unit).toBe('cup');
  });

  it('converts cups to milliliters correctly', () => {
    const res = convertAmountAndUnit(2, 'cup', 'metric');
    expect(res.amount).toBeCloseTo(473.18, 2);
    expect(res.unit).toBe('ml');
  });

  // Small dry/liquid conversions
  it('converts teaspoons to milliliters correctly', () => {
    const res = convertAmountAndUnit(3, 'tsp', 'metric');
    expect(res.amount).toBeCloseTo(14.79, 2);
    expect(res.unit).toBe('ml');
  });

  it('converts tablespoons to milliliters correctly', () => {
    const res = convertAmountAndUnit(2, 'tbsp', 'metric');
    expect(res.amount).toBeCloseTo(29.57, 2);
    expect(res.unit).toBe('ml');
  });

  // Identity / Passthrough conversions
  it('returns original amount/unit if already matching imperial preferences', () => {
    const res = convertAmountAndUnit(10, 'oz', 'imperial');
    expect(res.amount).toBe(10);
    expect(res.unit).toBe('oz');
  });

  it('returns original amount/unit if already matching metric preferences', () => {
    const res = convertAmountAndUnit(250, 'g', 'metric');
    expect(res.amount).toBe(250);
    expect(res.unit).toBe('g');
  });

  // Fallback defaults
  it('handles unknown units gracefully with default passthroughs', () => {
    const res = convertAmountAndUnit(5, 'pinches', 'metric');
    expect(res.amount).toBe(5);
    expect(res.unit).toBe('pinches');
  });
});
