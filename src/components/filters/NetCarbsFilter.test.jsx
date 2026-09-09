import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import NetCarbsFilter from './NetCarbsFilter';

const EXPECTED_OPTIONS = ['Any', '<10g', '10-20g', '20-30g', '30g+'];

describe('NetCarbsFilter', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders all 5 net carb filter options', () => {
    render(<NetCarbsFilter />);

    expect(screen.getByRole('radiogroup', { name: 'Net carbs filter' })).toBeInTheDocument();
    expect(screen.getByText('Net Carbs:')).toBeInTheDocument();

    EXPECTED_OPTIONS.forEach((label) => {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument();
    });
  });

  it('highlights the active option based on activeRange prop', () => {
    const { rerender } = render(<NetCarbsFilter activeRange="any" />);
    const anyRadio = screen.getByRole('radio', { name: 'Any' });
    const under10Radio = screen.getByRole('radio', { name: '<10g' });

    expect(anyRadio).toHaveAttribute('aria-checked', 'true');
    expect(anyRadio).toHaveClass('bg-primary');
    expect(under10Radio).toHaveAttribute('aria-checked', 'false');
    expect(under10Radio).not.toHaveClass('bg-primary');

    rerender(<NetCarbsFilter activeRange="<10g" />);
    expect(anyRadio).toHaveAttribute('aria-checked', 'false');
    expect(under10Radio).toHaveAttribute('aria-checked', 'true');
    expect(under10Radio).toHaveClass('bg-primary');
  });

  it('calls onRangeChange with correct value when an option is clicked', () => {
    const onRangeChange = vi.fn();
    render(<NetCarbsFilter activeRange="any" onRangeChange={onRangeChange} />);

    const opt10_20 = screen.getByRole('radio', { name: '10-20g' });
    fireEvent.click(opt10_20);
    expect(onRangeChange).toHaveBeenCalledWith('10-20g');

    const opt30plus = screen.getByRole('radio', { name: '30g+' });
    fireEvent.click(opt30plus);
    expect(onRangeChange).toHaveBeenCalledWith('30g+');

    const optAny = screen.getByRole('radio', { name: 'Any' });
    fireEvent.click(optAny);
    expect(onRangeChange).toHaveBeenCalledWith('any');
  });

  it('applies custom className to the radiogroup container', () => {
    render(<NetCarbsFilter className="custom-net-carbs-class" />);
    const container = screen.getByTestId('net-carbs-filter');
    expect(container).toHaveClass('custom-net-carbs-class');
  });
});
