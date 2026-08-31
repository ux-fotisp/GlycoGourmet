import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DraftAuditQueue } from '../DraftAuditQueue';
import { AuditComparisonView } from '../../components/admin/AuditComparisonView';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../hooks/usePermissions', () => ({
  usePermissions: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../utils/nutritionCalculator', () => ({
  deriveAllergensFromIngredients: vi.fn(() => []),
  calculateRecipeNutrition: vi.fn(() => ({
    kcal: 310, protein: 14.5, fat: 8.2, carbs: 28.0,
    fiber: 3.2, netCarbs: 24.8, glycemicIndex: 55, glycemicLoad: 13.6,
  })),
  getGlycemicLoadCategory: vi.fn(() => ({ label: 'Moderate Impact', colorClass: 'text-tertiary', bgClass: 'bg-tertiary/10' })),
}));

describe('US-2.3: Side-by-Side Draft Audit Queue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('Scenario 3.1: Blocks access and displays restriction banner for non-elevated user roles', () => {
    useAuth.mockReturnValue({ user: { roleType: 'user' } });
    usePermissions.mockReturnValue({ canPublishPublic: false });

    render(
      <MemoryRouter>
        <DraftAuditQueue />
      </MemoryRouter>
    );

    expect(screen.getByText(/Clinical Review Access Restricted/i)).toBeDefined();
  });

  it('Scenario 3.2: Highlights discrepancy fields in Soft Rose when author claim differs from system truth > 1.0', () => {
    const mockDraft = {
      id: 'draft-1',
      title: 'Discrepant Recipe Test',
      authorName: 'Chef Test',
      servings: 1,
      claimedNetCarbs: 10.0, // System calculated is 24.8 -> Diff > 1.0!
      claimedCarbs: 12.0,
      claimedFiber: 2.0,
      ingredients: [],
    };

    render(
      <MemoryRouter>
        <AuditComparisonView recipe={mockDraft} />
      </MemoryRouter>
    );

    // Discrepancy > 1.0 badge should be rendered
    expect(screen.getAllByText(/Discrepancy > 1.0/i).length).toBeGreaterThan(0);
  });

  it('Scenario 3.3: Overwrites author claim data with system ground truth upon clicking [ Sync to System Truth ]', () => {
    const mockDraft = {
      id: 'draft-1',
      title: 'Discrepant Recipe Test',
      authorName: 'Chef Test',
      servings: 1,
      claimedNetCarbs: 10.0,
      claimedCarbs: 12.0,
      claimedFiber: 2.0,
      ingredients: [],
    };

    render(
      <MemoryRouter>
        <AuditComparisonView recipe={mockDraft} />
      </MemoryRouter>
    );

    const syncBtn = screen.getByRole('button', { name: /Sync to System Truth/i });
    fireEvent.click(syncBtn);

    // Synced badge should now be displayed
    expect(screen.getByText(/Synced to System Truth/i)).toBeDefined();
  });
});
