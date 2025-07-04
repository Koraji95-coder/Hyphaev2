import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './useAuth';

vi.mock('@/services/auth', () => {
  return {
    registerUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
    refreshToken: vi.fn(),
    setPin: vi.fn(),
    verifyPin: vi.fn(),
    changePin: vi.fn(),
    requestPasswordReset: vi.fn(),
  };
});

import { refreshToken as refreshMock, getProfile as profileMock } from '@/services/auth';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth init', () => {
  beforeEach(() => {
    localStorage.clear();
    refreshMock.mockClear();
    profileMock.mockClear();
  });

  it('does not call network when no stored token', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(refreshMock).not.toHaveBeenCalled();
    expect(profileMock).not.toHaveBeenCalled();
  });
});
