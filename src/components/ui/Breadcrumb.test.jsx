import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Breadcrumb from './Breadcrumb';

describe('Breadcrumb component', () => {
  it('renders backLabel and currentLabel correctly', () => {
    render(
      <Breadcrumb
        backLabel="All Recipes"
        currentLabel="Mediterranean Spinach Scramble"
      />
    );
    expect(screen.getByText('All Recipes')).toBeDefined();
    expect(screen.getByText('Mediterranean Spinach Scramble')).toBeDefined();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeDefined();
  });

  it('calls onBack callback when back link is clicked', () => {
    const handleBack = vi.fn();
    render(
      <Breadcrumb
        backLabel="All Recipes"
        currentLabel="Power Salad"
        onBack={handleBack}
      />
    );
    const backBtn = screen.getByRole('button', { name: /All Recipes/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });

  it('renders anchor tag when backHref is provided', () => {
    render(
      <Breadcrumb
        backLabel="Catalog"
        backHref="/recipes/all"
        currentLabel="Salmon Bowl"
      />
    );
    const link = screen.getByRole('link', { name: /Catalog/i });
    expect(link.getAttribute('href')).toBe('/recipes/all');
  });

  it('truncates a long currentLabel with truncate class and sets title attribute', () => {
    const longTitle =
      'Ultra Low-Glycemic Mediterranean Wild Atlantic Salmon with Steamed Romanesco and Raw Hass Avocado';
    render(
      <Breadcrumb
        backLabel="All Recipes"
        currentLabel={longTitle}
      />
    );
    const currentSpan = screen.getByTestId('breadcrumb-current');
    expect(currentSpan.textContent).toBe(longTitle);
    expect(currentSpan.className).toContain('truncate');
    expect(currentSpan.className).toContain('max-w-xs');
    expect(currentSpan.getAttribute('title')).toBe(longTitle);
  });

  it('renders without currentLabel when not provided', () => {
    render(<Breadcrumb backLabel="Dashboard" />);
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.queryByTestId('breadcrumb-current')).toBeNull();
  });
});
