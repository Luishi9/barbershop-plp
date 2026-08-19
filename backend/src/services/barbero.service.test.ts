/**
 * BarberoService unit tests. The Supabase admin client (auth.admin) is mocked
 * so no real Auth user is provisioned.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BarberoRepository } from '../repositories/barbero.repository.js';
import { ApiError } from '../utils/http.js';
import { BarberoService } from './barbero.service.js';

const BARBERO_ID = '22222222-2222-2222-2222-222222222222';
const validInput = { nombre: 'Miguel', email: 'miguel@example.com', password: 'Barberia2026!' };

describe('BarberoService', () => {
  let repo: jest.Mocked<BarberoRepository>;
  let db: { auth: { admin: { createUser: jest.Mock; deleteUser: jest.Mock } } };
  let service: BarberoService;

  beforeEach(() => {
    repo = { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as unknown as jest.Mocked<BarberoRepository>;
    db = { auth: { admin: { createUser: jest.fn(), deleteUser: jest.fn() } } };
    service = new BarberoService(repo, db as unknown as SupabaseClient);
  });

  it('create provisions an auth user then the profile row', async () => {
    const profile = { id: BARBERO_ID, ...validInput, rol: 'barbero' } as never;
    db.auth.admin.createUser.mockResolvedValue({ data: { user: { id: BARBERO_ID } }, error: null } as never);
    repo.create.mockResolvedValue(profile);
    await expect(service.create(validInput)).resolves.toEqual(profile);
    expect(db.auth.admin.createUser).toHaveBeenCalledWith(expect.objectContaining({ email: validInput.email }));
    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ id: BARBERO_ID, nombre: validInput.nombre }));
  });

  it('create throws 400 when the auth provisioning fails', async () => {
    db.auth.admin.createUser.mockResolvedValue({ data: { user: null }, error: { message: 'email already registered' } } as never);
    await expect(service.create(validInput)).rejects.toMatchObject({ statusCode: 400 });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('update throws 404 when the barbero does not exist', async () => {
    repo.update.mockResolvedValue(null);
    await expect(service.update(BARBERO_ID, { nombre: 'Nuevo' })).rejects.toBeInstanceOf(ApiError);
  });

  it('remove throws 404 when the barbero does not exist', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.remove(BARBERO_ID)).rejects.toBeInstanceOf(ApiError);
  });

  it('remove deletes the auth user after confirming the barbero exists', async () => {
    repo.findById.mockResolvedValue({ id: BARBERO_ID } as never);
    db.auth.admin.deleteUser.mockResolvedValue({ error: null } as never);
    await expect(service.remove(BARBERO_ID)).resolves.toBeUndefined();
    expect(db.auth.admin.deleteUser).toHaveBeenCalledWith(BARBERO_ID);
  });
});