import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusChip from './StatusChip';

describe('StatusChip component', () => {
  it('renders ON TRACK state with correct text and sage color classes', () => {
    render(<StatusChip status="ON TRACK" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.textContent).toBe('ON TRACK');
    expect(chip.className).toContain('bg-sage-bg');
    expect(chip.className).toContain('text-sage-text');
    expect(chip.className).toContain('border-sage-text/20');
    expect(chip.className).toContain('rounded-full');
  });

  it('renders PENDING state with correct text and amber color classes', () => {
    render(<StatusChip status="PENDING" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.textContent).toBe('PENDING');
    expect(chip.className).toContain('bg-amber-bg');
    expect(chip.className).toContain('text-amber-text');
    expect(chip.className).toContain('border-amber-text/20');
    expect(chip.className).toContain('rounded-full');
  });

  it('renders HIGH RISK state with correct text and rose color classes', () => {
    render(<StatusChip status="HIGH RISK" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.textContent).toBe('HIGH RISK');
    expect(chip.className).toContain('bg-rose-bg');
    expect(chip.className).toContain('text-rose-text');
    expect(chip.className).toContain('border-rose-text/20');
    expect(chip.className).toContain('rounded-full');
  });

  it('normalizes lowercase and mixed-case status prop values', () => {
    render(<StatusChip status="pending" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.textContent).toBe('PENDING');
    expect(chip.className).toContain('bg-amber-bg');
  });

  it('defaults to ON TRACK when status prop is omitted', () => {
    render(<StatusChip />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.textContent).toBe('ON TRACK');
    expect(chip.className).toContain('bg-sage-bg');
  });

  it('applies custom className when provided', () => {
    render(<StatusChip status="ON TRACK" className="custom-test-class" />);
    const chip = screen.getByTestId('status-chip');
    expect(chip.className).toContain('custom-test-class');
  });
});
