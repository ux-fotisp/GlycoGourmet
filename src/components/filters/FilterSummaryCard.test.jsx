import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import FilterSummaryCard from './FilterSummaryCard';

describe('FilterSummaryCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default state with Filters label and icon, but no badge or Clear All when activeCount is 0', () => {
    render(<FilterSummaryCard />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByTestId('filter-sliders-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('filter-active-badge')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clear-all-btn')).not.toBeInTheDocument();
    expect(screen.getByTestId('toggle-advanced-btn')).toBeInTheDocument();
  });

  it('renders activeCount badge only when activeCount > 0', () => {
    const { rerender } = render(<FilterSummaryCard activeCount={0} />);
    expect(screen.queryByTestId('filter-active-badge')).not.toBeInTheDocument();

    rerender(<FilterSummaryCard activeCount={3} />);
    const badge = screen.getByTestId('filter-active-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('3 active');
  });

  it('hides Clear All when activeCount is 0 and shows it when activeCount > 0', () => {
    const { rerender } = render(<FilterSummaryCard activeCount={0} />);
    expect(screen.queryByTestId('clear-all-btn')).not.toBeInTheDocument();

    rerender(<FilterSummaryCard activeCount={1} />);
    expect(screen.getByTestId('clear-all-btn')).toBeInTheDocument();
  });

  it('calls onClearAll when Clear All button is clicked', () => {
    const onClearAll = vi.fn();
    render(<FilterSummaryCard activeCount={2} onClearAll={onClearAll} />);

    const clearBtn = screen.getByTestId('clear-all-btn');
    fireEvent.click(clearBtn);

    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it('calls onToggleAdvanced when Advanced button is clicked', () => {
    const onToggleAdvanced = vi.fn();
    render(<FilterSummaryCard onToggleAdvanced={onToggleAdvanced} />);

    const toggleBtn = screen.getByTestId('toggle-advanced-btn');
    fireEvent.click(toggleBtn);

    expect(onToggleAdvanced).toHaveBeenCalledTimes(1);
  });

  it('changes chevron rotation class and aria-expanded based on isAdvancedOpen', () => {
    const { rerender } = render(<FilterSummaryCard isAdvancedOpen={false} />);
    const toggleBtn = screen.getByTestId('toggle-advanced-btn');
    const chevron = screen.getByTestId('advanced-chevron');

    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
    expect(chevron).toHaveClass('rotate-0');
    expect(chevron).not.toHaveClass('rotate-180');

    rerender(<FilterSummaryCard isAdvancedOpen={true} />);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(chevron).toHaveClass('rotate-180');
    expect(chevron).not.toHaveClass('rotate-0');
  });

  it('accepts and applies custom className to container', () => {
    render(<FilterSummaryCard className="custom-filter-class" />);
    const card = screen.getByTestId('filter-summary-card');
    expect(card.className).toContain('custom-filter-class');
  });
});
