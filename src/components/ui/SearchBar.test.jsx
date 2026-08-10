import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar component', () => {
  // --- Icon prefix ---
  it('renders the auto_awesome icon prefix', () => {
    const { container } = render(
      <SearchBar value="" onChange={() => {}} placeholder="Search recipes..." />
    );
    const icon = container.querySelector('.material-symbols-outlined');
    expect(icon).toBeDefined();
    expect(icon.textContent.trim()).toBe('auto_awesome');
  });

  // --- Text capture ---
  it('captures text changes via onChange callback', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} placeholder="Search..." />);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'salmon recipe' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  // --- Placeholder ---
  it('displays placeholder text correctly', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="I want a low-GI breakfast" />);
    expect(screen.getByPlaceholderText('I want a low-GI breakfast')).toBeDefined();
  });

  // --- Value binding ---
  it('binds the value prop to the input', () => {
    render(<SearchBar value="quinoa" onChange={() => {}} placeholder="Search" />);
    expect(screen.getByDisplayValue('quinoa')).toBeDefined();
  });

  // --- Focus scale effect ---
  it('applies scale-100 class by default (unfocused)', () => {
    const { container } = render(
      <SearchBar value="" onChange={() => {}} placeholder="Focus test" />
    );
    const wrapper = container.firstChild;
    expect(wrapper.className).toContain('scale-100');
  });
});
