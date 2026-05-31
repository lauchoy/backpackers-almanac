// Dexie IndexedDB store for packing list — BUILD-SPEC §4.2, §5.3

import Dexie, { type Table } from 'dexie';
import type { PackingItem } from '../data/packing-seed';

class PackingDB extends Dexie {
  items!: Table<PackingItem, string>;

  constructor() {
    super('backpackersAlmanac');
    this.version(1).stores({
      items: 'id, category, checked',
    });
  }
}

export const db = new PackingDB();

export async function seedPackingList(seed: PackingItem[]) {
  const count = await db.items.count();
  if (count === 0) {
    await db.items.bulkAdd(seed);
  }
}

export async function getAllItems(): Promise<PackingItem[]> {
  return db.items.toArray();
}

export async function toggleItem(id: string): Promise<void> {
  const item = await db.items.get(id);
  if (item) {
    await db.items.update(id, { checked: !item.checked });
  }
}

export async function addItem(item: PackingItem): Promise<void> {
  await db.items.add(item);
}

export async function updateItem(id: string, changes: Partial<PackingItem>): Promise<void> {
  await db.items.update(id, changes);
}

export async function deleteItem(id: string): Promise<void> {
  await db.items.delete(id);
}
