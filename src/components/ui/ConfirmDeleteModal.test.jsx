import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

describe('ConfirmDeleteModal component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ConfirmDeleteModal isOpen={false} onConfirm={vi.fn()} onCancel={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title and item name when open', () => {
    render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete Recipe?"
        itemTitle="Keto Salad"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText('Delete Recipe?')).toBeDefined();
    expect(screen.getByText(/Keto Salad/i)).toBeDefined();
  });

  it('triggers onConfirm when Delete button is clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDeleteModal
        isOpen={true}
        itemTitle="Keto Salad"
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText(/Delete Permanently/i));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers onCancel when Cancel button is clicked', () => {
    const handleCancel = vi.fn();
    render(
      <ConfirmDeleteModal
        isOpen={true}
        itemTitle="Keto Salad"
        onConfirm={vi.fn()}
        onCancel={handleCancel}
      />
    );
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });
});
