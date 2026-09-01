import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from './apiClient';

describe('apiClient', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends JSON and bearer credentials for authenticated requests', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ profile: { id: 'profile-id' } }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await expect(
      apiClient('/students/me', { method: 'PATCH', body: { name: 'Amina' }, token: 'token-value' }),
    ).resolves.toEqual({ profile: { id: 'profile-id' } });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/students/me',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ name: 'Amina' }),
        headers: expect.objectContaining({ Authorization: 'Bearer token-value' }),
      }),
    );
  });

  it('normalizes API failures into ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ error: { message: 'Invalid request' } }), { status: 400 }),
        ),
    );

    await expect(apiClient('/students/me')).rejects.toMatchObject({
      message: 'Invalid request',
      status: 400,
    });
  });
});
