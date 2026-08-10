import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login page', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    useAuth.mockReturnValue({
      login: mockLogin,
    });
  });

  afterEach(() => {
    cleanup();
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

  // --- Renders login form ---
  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('name@example.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
  });

  it('renders Sign In button', () => {
    renderLogin();
    expect(screen.getByText('Sign In')).toBeDefined();
  });

  // --- Validation ---
  it('shows error when fields are empty on submit', async () => {
    const { container } = renderLogin();
    fireEvent.submit(container.querySelector('form'));
    expect(screen.getByText('Please fill in all fields')).toBeDefined();
  });

  // --- Successful login ---
  it('navigates to / on successful login', async () => {
    mockLogin.mockResolvedValue({ success: true });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'demo@glyco.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'demo123' },
    });
    fireEvent.click(screen.getByText('Sign In'));

    // Wait for async login
    await vi.waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // --- Failed login ---
  it('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('name@example.com'), {
      target: { value: 'wrong@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'badpass' },
    });
    fireEvent.click(screen.getByText('Sign In'));

    await vi.waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeDefined();
    });
  });

  // --- Register link ---
  it('renders link to registration page', () => {
    const { container } = renderLogin();
    const registerLink = container.querySelector('a[href="/register"]');
    expect(registerLink).not.toBeNull();
  });

  // --- Demo credentials hint ---
  it('displays demo login credentials hint', () => {
    renderLogin();
    expect(screen.getByText(/demo@glyco.com/)).toBeDefined();
  });
});
