// Packing-list seed data — BUILD-SPEC §5.3
// Field-kit categories with items. Each: { id, category, name, status, note, checked }

export interface PackingItem {
  id: string;
  category: string;
  name: string;
  status: 'buy' | 'own' | 'rent' | 'split';
  note: string;
  checked: boolean;
}

export const PACKING_SEED: PackingItem[] = [
  // Carry System
  { id: 'c1', category: 'Carry System', name: 'Backpack (60-70L)', status: 'own', note: '', checked: false },
  { id: 'c2', category: 'Carry System', name: 'Day pack (collapsible)', status: 'own', note: 'for day hikes', checked: false },

  // Shelter
  { id: 's1', category: 'Shelter', name: 'Tent (2P)', status: 'split', note: 'Phil brings', checked: false },
  { id: 's2', category: 'Shelter', name: 'Footprint / groundsheet', status: 'own', note: '', checked: false },
  { id: 's3', category: 'Shelter', name: 'Stakes (extra)', status: 'own', note: '', checked: false },

  // Sleep System
  { id: 'sl1', category: 'Sleep System', name: 'Sleeping bag (20°F)', status: 'own', note: '', checked: false },
  { id: 'sl2', category: 'Sleep System', name: 'Sleeping pad', status: 'own', note: '', checked: false },
  { id: 'sl3', category: 'Sleep System', name: 'Pillow (inflatable)', status: 'own', note: '', checked: false },

  // Kitchen & Water
  { id: 'k1', category: 'Kitchen & Water', name: 'Stove + fuel canister', status: 'own', note: 'fire likely banned', checked: false },
  { id: 'k2', category: 'Kitchen & Water', name: 'Cook pot + spork', status: 'own', note: '', checked: false },
  { id: 'k3', category: 'Kitchen & Water', name: 'Water filter (Sawyer/BeFree)', status: 'own', note: 'critical — Yosemite Creek only source', checked: false },
  { id: 'k4', category: 'Kitchen & Water', name: 'Water bottles/bladder (3L+)', status: 'own', note: 'exposed day hikes', checked: false },
  { id: 'k5', category: 'Kitchen & Water', name: 'Bear canister — #1', status: 'buy', note: 'required everywhere', checked: false },
  { id: 'k6', category: 'Kitchen & Water', name: 'Bear canister — #2', status: 'rent', note: 'two for two people / 3 nights', checked: false },
  { id: 'k7', category: 'Kitchen & Water', name: 'Lighter / matches', status: 'own', note: '', checked: false },

  // Clothing
  { id: 'cl1', category: 'Clothing', name: 'Hiking shirt (synthetic/wool)', status: 'own', note: 'NO COTTON', checked: false },
  { id: 'cl2', category: 'Clothing', name: 'Hiking pants/shorts', status: 'own', note: '', checked: false },
  { id: 'cl3', category: 'Clothing', name: 'Rain shell', status: 'own', note: 'non-negotiable', checked: false },
  { id: 'cl4', category: 'Clothing', name: 'Insulation layer (puffy/fleece)', status: 'own', note: 'high camp ~6,700 ft', checked: false },
  { id: 'cl5', category: 'Clothing', name: 'Sleep clothes (base layer)', status: 'own', note: '', checked: false },
  { id: 'cl6', category: 'Clothing', name: 'Extra socks (2 pr)', status: 'own', note: '', checked: false },
  { id: 'cl7', category: 'Clothing', name: 'Hat / beanie', status: 'own', note: '', checked: false },
  { id: 'cl8', category: 'Clothing', name: 'Camp shoes (lightweight)', status: 'own', note: '', checked: false },

  // Navigation & Power
  { id: 'n1', category: 'Navigation & Power', name: 'Phone + GPS app', status: 'own', note: 'Gaia / CalTopo / AllTrails', checked: false },
  { id: 'n2', category: 'Navigation & Power', name: 'Power bank (10,000+ mAh)', status: 'own', note: '', checked: false },
  { id: 'n3', category: 'Navigation & Power', name: 'Charging cable', status: 'own', note: '', checked: false },
  { id: 'n4', category: 'Navigation & Power', name: 'Paper map + compass', status: 'own', note: '', checked: false },
  { id: 'n5', category: 'Navigation & Power', name: 'Satellite messenger (InReach)', status: 'split', note: 'Phil has?', checked: false },

  // Safety & First Aid
  { id: 'sa1', category: 'Safety & First Aid', name: 'First aid kit', status: 'own', note: 'include blister care', checked: false },
  { id: 'sa2', category: 'Safety & First Aid', name: 'Headlamp + extra batteries', status: 'own', note: '', checked: false },
  { id: 'sa3', category: 'Safety & First Aid', name: 'Knife / multi-tool', status: 'own', note: '', checked: false },
  { id: 'sa4', category: 'Safety & First Aid', name: 'Emergency blanket', status: 'own', note: '', checked: false },
  { id: 'sa5', category: 'Safety & First Aid', name: 'Whistle', status: 'own', note: '', checked: false },

  // Sun & Bugs
  { id: 'su1', category: 'Sun & Bugs', name: 'Sunscreen', status: 'own', note: 'non-negotiable', checked: false },
  { id: 'su2', category: 'Sun & Bugs', name: 'Sunglasses', status: 'own', note: '', checked: false },
  { id: 'su3', category: 'Sun & Bugs', name: 'Bug repellent', status: 'own', note: '', checked: false },
  { id: 'su4', category: 'Sun & Bugs', name: 'Sun hoodie / UPF layer', status: 'own', note: '', checked: false },

  // Leave No Trace & Hygiene
  { id: 'l1', category: 'Leave No Trace & Hygiene', name: 'Trowel + TP + wipes', status: 'own', note: '', checked: false },
  { id: 'l2', category: 'Leave No Trace & Hygiene', name: 'Hand sanitizer', status: 'own', note: '', checked: false },
  { id: 'l3', category: 'Leave No Trace & Hygiene', name: 'Trash bag (pack it out)', status: 'own', note: '', checked: false },
  { id: 'l4', category: 'Leave No Trace & Hygiene', name: 'Toothbrush + paste', status: 'own', note: '', checked: false },

  // Food & Consumables
  { id: 'f1', category: 'Food & Consumables', name: 'Breakfast (3 days)', status: 'buy', note: 'oatmeal / bars / coffee', checked: false },
  { id: 'f2', category: 'Food & Consumables', name: 'Lunch (4 days)', status: 'buy', note: 'tortillas, tuna, cheese, bars', checked: false },
  { id: 'f3', category: 'Food & Consumables', name: 'Dinner (3 nights)', status: 'buy', note: 'dehydrated meals', checked: false },
  { id: 'f4', category: 'Food & Consumables', name: 'Snacks', status: 'buy', note: 'trail mix, jerky, candy', checked: false },
  { id: 'f5', category: 'Food & Consumables', name: 'Electrolytes', status: 'buy', note: 'Nuun / LMNT / Gatorade powder', checked: false },

  // Documents
  { id: 'd1', category: 'Documents', name: 'Permit (printed)', status: 'own', note: 'pick up Tue AM at Wilderness Center', checked: false },
  { id: 'd2', category: 'Documents', name: 'ID + National Parks Pass', status: 'own', note: '', checked: false },
  { id: 'd3', category: 'Documents', name: 'Cash / card', status: 'own', note: '', checked: false },

  // Car / Valley Stash
  { id: 'v1', category: 'Car / Valley Stash', name: 'Cooler + post-trip feast', status: 'own', note: 'stash in bear locker, NOT car', checked: false },
  { id: 'v2', category: 'Car / Valley Stash', name: 'Change of clothes', status: 'own', note: 'leave in car', checked: false },
  { id: 'v3', category: 'Car / Valley Stash', name: 'Towel + toiletries', status: 'own', note: 'for post-trip shower', checked: false },
];

export const PACKING_CATEGORIES = [
  'Carry System',
  'Shelter',
  'Sleep System',
  'Kitchen & Water',
  'Clothing',
  'Navigation & Power',
  'Safety & First Aid',
  'Sun & Bugs',
  'Leave No Trace & Hygiene',
  'Food & Consumables',
  'Documents',
  'Car / Valley Stash',
];
