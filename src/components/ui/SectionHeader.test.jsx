import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Bookmark } from 'lucide-react';
import SectionHeader from './SectionHeader';

describe('SectionHeader component', () => {
  it('renders title with uppercase styling and bone surface background', () => {
    render(<SectionHeader title="Recommended For You" />);
    const header = screen.getByTestId('section-header');
    expect(screen.getByText('Recommended For You')).toBeDefined();
    expect(header.className).toContain('bg-surface');
    expect(header.className).toContain('border-border-subtle');
    expect(header.className).toContain('rounded-2xl');
  });

  it('renders default Sparkles icon when none provided', () => {
    render(<SectionHeader title="Recommended For You" />);
    const icon = screen.getByTestId('section-header-icon');
    expect(icon).toBeDefined();
    expect(icon.getAttribute('class')).toContain('text-primary');
  });

  it('renders custom icon when provided', () => {
    render(<SectionHeader title="Saved Meals" icon={Bookmark} />);
    const icon = screen.getByTestId('section-header-icon');
    expect(icon).toBeDefined();
    expect(screen.getByText('Saved Meals')).toBeDefined();
  });

  it('renders actionLabel and triggers onAction when clicked', () => {
    const handleAction = vi.fn();
    render(
      <SectionHeader
        title="Recommended For You"
        actionLabel="View All"
        onAction={handleAction}
      />
    );
    const actionBtn = screen.getByRole('button', { name: /View All/i });
    expect(actionBtn).toBeDefined();
    fireEvent.click(actionBtn);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('renders anchor tag when actionHref is provided', () => {
    render(
      <SectionHeader
        title="Recommended For You"
        actionLabel="View All"
        actionHref="/recipes/all"
      />
    );
    const link = screen.getByRole('link', { name: /View All/i });
    expect(link.getAttribute('href')).toBe('/recipes/all');
  });

  it('omits the action link entirely when no actionLabel is given', () => {
    render(<SectionHeader title="Today's Meal Plan" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
