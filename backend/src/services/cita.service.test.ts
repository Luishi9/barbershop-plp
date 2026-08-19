/**
 * CitaService unit tests. Repositories injected as mocks; env vars come from
 * src/test/setup.ts (no real Supabase calls are made).
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ApiError } from '../utils/http.js';
import { BarberoRepository } from '../repositories/barbero.repository.js';
import { CitaRepository } from '../repositories/cita.repository.js';
import { ClienteRepository } from '../repositories/cliente.repository.js';
import { ServicioRepository } from '../repositories/servicio.repository.js';
import { CitaService } from './cita.service.js';

const CLIENTE_ID = '11111111-1111-1111-1111-111111111111';
const BARBERO_ID = '22222222-2222-2222-2222-222222222222';
const SERVICIO_ID = '33333333-3333-3333-3333-333333333333';
const CITA_ID = '44444444-4444-4444-4444-444444444444';

const validInput = { clienteId: CLIENTE_ID, barberoId: BARBERO_ID, servicioId: SERVICIO_ID, fecha: '2026-01-10', hora: '10:00' };

describe('CitaService', () => {
  let citaRepo: jest.Mocked<CitaRepository>;
  let clienteRepo: jest.Mocked<ClienteRepository>;
  let barberoRepo: jest.Mocked<BarberoRepository>;
  let servicioRepo: jest.Mocked<ServicioRepository>;
  let service: CitaService;

  beforeEach(() => {
    citaRepo = { findAll: jest.fn(), findById: jest.fn(), create: jest.fn(), update: jest.fn(), remove: jest.fn() } as unknown as jest.Mocked<CitaRepository>;
    clienteRepo = { findById: jest.fn() } as unknown as jest.Mocked<ClienteRepository>;
    barberoRepo = { findById: jest.fn() } as unknown as jest.Mocked<BarberoRepository>;
    servicioRepo = { findById: jest.fn() } as unknown as jest.Mocked<ServicioRepository>;
    service = new CitaService(citaRepo, clienteRepo, barberoRepo, servicioRepo);
  });

  it('getById throws 404 when the cita does not exist', async () => {
    citaRepo.findById.mockResolvedValue(null);
    await expect(service.getById(CITA_ID)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('create validates the payload (zod)', async () => {
    await expect(service.create({ ...validInput, hora: '25:00' })).rejects.toThrow();
    expect(citaRepo.create).not.toHaveBeenCalled();
  });

  it('create rejects a cita whose relations do not exist', async () => {
    clienteRepo.findById.mockResolvedValue(null);
    await expect(service.create(validInput)).rejects.toMatchObject({ statusCode: 400 });
  });

  it('create throws 409 when the barbero already has a cita in that slot', async () => {
    clienteRepo.findById.mockResolvedValue({ id: CLIENTE_ID, nombre: 'A', telefono: '1' });
    barberoRepo.findById.mockResolvedValue({ id: BARBERO_ID } as never);
    servicioRepo.findById.mockResolvedValue({ id: SERVICIO_ID } as never);
    citaRepo.findAll.mockResolvedValue([{ id: CITA_ID } as never]);
    await expect(service.create(validInput)).rejects.toMatchObject({ statusCode: 409 });
  });

  it('create succeeds when the slot is free and persists the parsed data', async () => {
    const created = { id: CITA_ID, ...validInput, estado: 'pendiente' } as never;
    clienteRepo.findById.mockResolvedValue({ id: CLIENTE_ID, nombre: 'A', telefono: '1' });
    barberoRepo.findById.mockResolvedValue({ id: BARBERO_ID } as never);
    servicioRepo.findById.mockResolvedValue({ id: SERVICIO_ID } as never);
    citaRepo.findAll.mockResolvedValue([]);
    citaRepo.create.mockResolvedValue(created);
    await expect(service.create(validInput)).resolves.toEqual(created);
  });

  it('update detects slot conflicts excluding its own id', async () => {
    citaRepo.findById.mockResolvedValue({ id: CITA_ID, barberoId: BARBERO_ID, fecha: '2026-01-10', hora: '10:00' } as never);
    citaRepo.findAll.mockResolvedValue([{ id: '55555555-5555-5555-5555-555555555555' } as never]);
    await expect(service.update(CITA_ID, { hora: '11:00' })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('remove deletes after confirming the cita exists', async () => {
    citaRepo.findById.mockResolvedValue({ id: CITA_ID } as never);
    citaRepo.remove.mockResolvedValue(undefined);
    await expect(service.remove(CITA_ID)).resolves.toBeUndefined();
    expect(citaRepo.remove).toHaveBeenCalledWith(CITA_ID);
  });

  it('remove throws 404 for a missing cita', async () => {
    citaRepo.findById.mockResolvedValue(null);
    await expect(service.remove(CITA_ID)).rejects.toBeInstanceOf(ApiError);
  });
});