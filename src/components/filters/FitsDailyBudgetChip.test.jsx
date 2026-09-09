import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FitsDailyBudgetChip from './FitsDailyBudgetChip';

describe('FitsDailyBudgetChip', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default inactive state without CheckCircle icon or gradient class', () => {
    render(<FitsDailyBudgetChip />);

    const chip = screen.getByRole('switch', { name: 'Fits Daily Budget' });
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute('aria-checked', 'false');
    expect(chip).not.toHaveClass('btn-gradient-primary');
    expect(screen.queryByTestId('fits-budget-check-icon')).not.toBeInTheDocument();
  });

  it('renders CheckCircle icon and applies btn-gradient-primary class only when isActive is true', () => {
    const { rerender } = render(<FitsDailyBudgetChip isActive={false} />);
    const chip = screen.getByRole('switch', { name: 'Fits Daily Budget' });

    expect(chip).toHaveAttribute('aria-checked', 'false');
    expect(chip).not.toHaveClass('btn-gradient-primary');
    expect(screen.queryByTestId('fits-budget-check-icon')).not.toBeInTheDocument();

    rerender(<FitsDailyBudgetChip isActive={true} />);
    expect(chip).toHaveAttribute('aria-checked', 'true');
    expect(chip).toHaveClass('btn-gradient-primary');
    expect(screen.getByTestId('fits-budget-check-icon')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(<FitsDailyBudgetChip onClick={onClick} />);

    const chip = screen.getByRole('switch', { name: 'Fits Daily Budget' });
    fireEvent.click(chip);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('supports custom label and custom className', () => {
    render(<FitsDailyBudgetChip label="Daily GL Target" className="custom-budget-chip" />);

    const chip = screen.getByRole('switch', { name: 'Daily GL Target' });
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveClass('custom-budget-chip');
  });
});
