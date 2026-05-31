// Editable packing list — BUILD-SPEC §5.3
// Dexie-backed CRUD with categories, filters, and progress

import { useState, useEffect, useCallback } from 'react';
import type { PackingItem } from '../data/packing-seed';
import { PACKING_SEED, PACKING_CATEGORIES } from '../data/packing-seed';
import {
  seedPackingList,
  getAllItems,
  toggleItem,
  addItem,
  deleteItem,
} from '../store/packingDb';

export default function PackingList() {
  const [items, setItems] = useState<PackingItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: PACKING_CATEGORIES[0], note: '', status: 'own' as PackingItem['status'] });

  const loadItems = useCallback(async () => {
    await seedPackingList(PACKING_SEED);
    const all = await getAllItems();
    setItems(all);
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleToggle = async (id: string) => {
    await toggleItem(id);
    loadItems();
  };

  const handleAdd = async () => {
    if (!newItem.name.trim()) return;
    await addItem({
      id: `custom-${Date.now()}`,
      ...newItem,
      checked: false,
    });
    setShowAdd(false);
    setNewItem({ name: '', category: PACKING_CATEGORIES[0], note: '', status: 'own' });
    loadItems();
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
    loadItems();
  };

  const filtered = items.filter((i) => {
    if (filter === 'checked') return i.checked;
    if (filter === 'unchecked') return !i.checked;
    return true;
  });

  const checkedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  // Group by category
  const grouped: Record<string, PackingItem[]> = {};
  filtered.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  return (
    <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-700/50 p-3 max-h-[60vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
          Packing List
        </h3>
        <div className="flex items-center gap-2">
          {/* Progress */}
          <div className="text-[10px] text-slate-500">
            {checkedCount}/{items.length}
          </div>
          {/* Progress bar */}
          <div className="w-16 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-[10px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 hover:border-amber-400/60"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 mb-3">
        {(['all', 'unchecked', 'checked'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
              filter === f
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-slate-800/50 text-slate-500 border border-slate-700/30 hover:text-slate-300'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unchecked' ? 'To Pack' : 'Packed'}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/30 mb-2 space-y-1.5">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Item name"
            className="w-full bg-slate-700/50 text-slate-100 text-xs rounded px-2 py-1 border border-slate-600/50 focus:outline-none focus:border-amber-500/50"
            autoFocus
          />
          <div className="flex gap-1">
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              className="flex-1 bg-slate-700/50 text-slate-300 text-[10px] rounded px-2 py-1 border border-slate-600/50"
            >
              {PACKING_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={newItem.status}
              onChange={(e) => setNewItem({ ...newItem, status: e.target.value as PackingItem['status'] })}
              className="bg-slate-700/50 text-slate-300 text-[10px] rounded px-2 py-1 border border-slate-600/50"
            >
              <option value="own">own</option>
              <option value="buy">buy</option>
              <option value="rent">rent</option>
              <option value="split">split</option>
            </select>
          </div>
          <div className="flex gap-1">
            <input
              type="text"
              value={newItem.note}
              onChange={(e) => setNewItem({ ...newItem, note: e.target.value })}
              placeholder="Note (optional)"
              className="flex-1 bg-slate-700/50 text-slate-300 text-[10px] rounded px-2 py-1 border border-slate-600/50"
            />
            <button
              onClick={handleAdd}
              className="text-[10px] bg-amber-500/20 text-amber-400 px-3 rounded border border-amber-500/30 font-semibold"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Items by category */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category} className="mb-2">
          <div className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">
            {category}
          </div>
          <div className="space-y-0.5">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors group ${
                  item.checked ? 'bg-slate-800/20' : 'bg-slate-800/50'
                } border border-slate-700/30 hover:border-slate-600/50`}
              >
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                    item.checked
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {item.checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-xs leading-tight ${item.checked ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                    {item.name}
                  </div>
                  {item.note && (
                    <div className="text-[9px] text-slate-600 leading-tight truncate">{item.note}</div>
                  )}
                </div>
                {item.status !== 'own' && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    item.status === 'buy' ? 'bg-red-500/15 text-red-400' :
                    item.status === 'rent' ? 'bg-blue-500/15 text-blue-400' :
                    'bg-purple-500/15 text-purple-400'
                  }`}>
                    {item.status}
                  </span>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500/60 hover:text-red-400 px-1 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-xs text-slate-600 text-center py-4">No items {filter === 'checked' ? 'packed yet' : 'to pack'}</p>
      )}

      {/* Kit warnings */}
      <div className="mt-3 p-2 bg-amber-950/20 rounded-lg border border-amber-900/30">
        <div className="text-[9px] text-amber-500/80 leading-snug">
          ⚠ <strong>Critical:</strong> two bear canisters · water filter · rain shell · sun protection · NO COTTON
        </div>
      </div>
    </div>
  );
}
