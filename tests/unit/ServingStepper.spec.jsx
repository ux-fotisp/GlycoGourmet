import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ServingStepper from '@/components/recipe/ServingStepper';

describe('ServingStepper', () => {
  it('renders all four discrete multiplier options', () => {
    render(<ServingStepper currentMultiplier={1} onScaleChange={() => {}} disabled={false} />);
    expect(screen.getByRole('radio', { name: 'Scale recipe by 0.5x' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Scale recipe by 1x' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Scale recipe by 1.5x' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Scale recipe by 2x' })).toBeInTheDocument();
  });

  it('indicates active state with aria-checked', () => {
    render(<ServingStepper currentMultiplier={1.5} onScaleChange={() => {}} disabled={false} />);
    const activePill = screen.getByRole('radio', { name: 'Scale recipe by 1.5x' });
    const inactivePill = screen.getByRole('radio', { name: 'Scale recipe by 1x' });
    
    expect(activePill).toHaveAttribute('aria-checked', 'true');
    expect(inactivePill).toHaveAttribute('aria-checked', 'false');
    
    // Check colors class presence (Deep Pine active, Neutral inactive)
    expect(activePill.className).toContain('bg-[#1B3B22]');
    expect(inactivePill.className).toContain('bg-[#F0EFE9]');
  });

  it('calls onScaleChange with correct multiplier on click', () => {
    const onScaleChange = vi.fn();
    render(<ServingStepper currentMultiplier={1} onScaleChange={onScaleChange} disabled={false} />);
    
    fireEvent.click(screen.getByRole('radio', { name: 'Scale recipe by 2x' }));
    expect(onScaleChange).toHaveBeenCalledWith(2);
  });

  it('respects disabled state', () => {
    const onScaleChange = vi.fn();
    render(<ServingStepper currentMultiplier={1} onScaleChange={onScaleChange} disabled={true} />);
    
    const pill = screen.getByRole('radio', { name: 'Scale recipe by 2x' });
    expect(pill).toBeDisabled();
    
    fireEvent.click(pill);
    expect(onScaleChange).not.toHaveBeenCalled();
  });

  it('meets touch target bounding requirements >= 48px', () => {
    render(<ServingStepper currentMultiplier={1} onScaleChange={() => {}} disabled={false} />);
    const pill = screen.getByRole('radio', { name: 'Scale recipe by 1x' });
    
    // Check Tailwind classes for min dimensions
    expect(pill.className).toContain('min-h-[48px]');
    expect(pill.className).toContain('min-w-[48px]');
  });
});
