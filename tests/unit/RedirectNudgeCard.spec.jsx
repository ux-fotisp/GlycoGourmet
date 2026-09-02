import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RedirectNudgeCard } from '../../src/components/patient/RedirectNudgeCard';

const renderCard = (props = {}) => {
  return render(
    <MemoryRouter>
      <RedirectNudgeCard {...props} />
    </MemoryRouter>
  );
};

describe('RedirectNudgeCard Component', () => {
  it('renders compassionate, voluntary support invitation with 3 distinct actions', () => {
    renderCard();

    expect(screen.getByRole('region', { name: /Optional Dietitian Support Opportunity/i })).toBeInTheDocument();
    expect(screen.getByText('Optional Dietitian Support')).toBeInTheDocument();
    expect(screen.getByText('Voluntary Collaboration')).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Keep managing my plan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Explore Dietitian Consultations/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Why am I seeing this recommendation\?/i })).toBeInTheDocument();
  });

  it('allows patient to select "Keep managing my plan" and dismisses without punitive side effects', () => {
    const onKeep = vi.fn();
    renderCard({ onKeepManaging: onKeep });

    const keepBtn = screen.getByRole('button', { name: /Keep managing my plan/i });
    fireEvent.click(keepBtn);

    expect(onKeep).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('region', { name: /Optional Dietitian Support Opportunity/i })).not.toBeInTheDocument();
  });

  it('invokes consultation callback when user chooses to explore support', () => {
    const onExplore = vi.fn();
    renderCard({ onExploreDietitians: onExplore });

    const exploreBtn = screen.getByRole('button', { name: /Explore Dietitian Consultations/i });
    fireEvent.click(exploreBtn);

    expect(onExplore).toHaveBeenCalledTimes(1);
  });

  it('opens "Why am I seeing this?" panel when requested', () => {
    renderCard();

    const whyBtn = screen.getByRole('button', { name: /Why am I seeing this recommendation\?/i });
    fireEvent.click(whyBtn);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Why am I seeing this consultation option\?/i)).toBeInTheDocument();
  });

  it('contains zero coercive, shaming, or failure language', () => {
    const { container } = renderCard();
    const text = container.textContent || '';

    expect(text).not.toMatch(/failed/i);
    expect(text).not.toMatch(/unsafe/i);
    expect(text).not.toMatch(/non-compliant/i);
    expect(text).not.toMatch(/must see dietitian/i);
    expect(text).not.toMatch(/best match/i);
    expect(text).not.toMatch(/compatibility score/i);
  });
});