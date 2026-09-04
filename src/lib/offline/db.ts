import Dexie, { Table } from 'dexie';
import { HeritageSite } from '@/types';

export interface OfflineHeritageSite extends HeritageSite {
  downloadedAt: string;
}

export interface PendingAction {
  id?: number;
  type: 'condition-report' | 'documentation' | 'oral-story';
  payload: unknown;
  createdAt: string;
}

class LokVirasatDB extends Dexie {
  heritageSites!: Table<OfflineHeritageSite, string>;
  pendingActions!: Table<PendingAction, number>;

  constructor() {
    super('LokVirasatDB');

    this.version(1).stores({
      heritageSites: 'id, downloadedAt',
      pendingActions: '++id, type, createdAt',
    });
  }
}

export const offlineDB = new LokVirasatDB();

/* ─────────────────────────────────────────────
   HERITAGE SITE FUNCTIONS
───────────────────────────────────────────── */

export async function saveOfflineHeritage(
  site: HeritageSite
) {
  await offlineDB.heritageSites.put({
    ...site,
    downloadedAt: new Date().toISOString(),
  });
}

export async function getOfflineHeritage(
  siteId: string
) {
  return offlineDB.heritageSites.get(siteId);
}

export async function getAllOfflineHeritage() {
  return offlineDB.heritageSites.toArray();
}

export async function removeOfflineHeritage(
  siteId: string
) {
  await offlineDB.heritageSites.delete(siteId);
}

/* ─────────────────────────────────────────────
   PENDING ACTIONS
───────────────────────────────────────────── */

export async function savePendingAction(
  action: Omit<PendingAction, 'id' | 'createdAt'>
) {
  await offlineDB.pendingActions.add({
    ...action,
    createdAt: new Date().toISOString(),
  });
}

export async function getPendingActions() {
  return offlineDB.pendingActions.toArray();
}

export async function removePendingAction(
  id: number
) {
  await offlineDB.pendingActions.delete(id);
}