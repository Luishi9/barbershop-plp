/**
 * ClienteService unit tests.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError } from '../utils/http.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ClienteService } from './cliente.service.js';

const CLIENTE_ID = '11111111-1111-1111-1111-111111111111';
const validInput = { nombre: 'Juan', telefono: '555-1234', email: 'juan@example.com' };

describe('ClienteService', () => {
  let repo: jest.Mocked<ClienteRepository>;
  let service: ClienteService;

  beforeEach(() => {
    repo = { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as unknown as jest.Mocked<ClienteRepository>;
    service = new ClienteService(repo);
  });

  it('create validates the payload (zod)', async () => {
    await expect(service.create({ ...validInput, telefono: '' })).rejects.toThrow();
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('create persists the parsed payload', async () => {
    const created = { id: CLIENTE_ID, ...validInput } as never;
    repo.create.mockResolvedValue(created);
    await expect(service.create(validInput)).resolves.toEqual(created);
  });

  it('getById throws 404 when the cliente does not exist', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getById(CLIENTE_ID)).rejects.toBeInstanceOf(ApiError);
  });

  it('update throws 404 when the cliente does not exist', async () => {
    repo.update.mockResolvedValue(null);
    await expect(service.update(CLIENTE_ID, { nombre: 'Nuevo' })).rejects.toBeInstanceOf(ApiError);
  });

  it('remove deletes after confirming the cliente exists', async () => {
    repo.findById.mockResolvedValue({ id: CLIENTE_ID, nombre: 'Juan', telefono: '555-1234' });
    repo.remove.mockResolvedValue(undefined);
    await expect(service.remove(CLIENTE_ID)).resolves.toBeUndefined();
    expect(repo.remove).toHaveBeenCalledWith(CLIENTE_ID);
  });
});