import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TagChip from './TagChip';

describe('TagChip component', () => {
  // --- Active State ---
  it('displays bg-primary class and check icon when active', () => {
    render(<TagChip label="Low GI" active={true} onClick={() => {}} />);
    const chip = screen.getByRole('button', { name: /Low GI/i });
    expect(chip.className).toContain('bg-primary');
    expect(chip.className).toContain('text-on-primary');
    // Check icon should be present
    expect(chip.querySelector('.material-symbols-outlined')).toBeDefined();
    expect(chip.textContent).toContain('check');
  });

  // --- Default/Inactive State ---
  it('displays bg-surface-container-low class and no check icon when inactive', () => {
    render(<TagChip label="High Fiber" active={false} onClick={() => {}} />);
    const chip = screen.getByRole('button', { name: 'High Fiber' });
    expect(chip.className).toContain('bg-surface-container-low');
    expect(chip.className).toContain('text-on-surface-variant');
    // No check icon
    expect(chip.querySelector('.material-symbols-outlined')).toBeNull();
  });

  // --- Toggle Behavior ---
  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<TagChip label="Keto" active={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Keto' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders label text correctly', () => {
    render(<TagChip label="High Protein" active={false} onClick={() => {}} />);
    expect(screen.getByText('High Protein')).toBeDefined();
  });
});
