const osrItems = {
  adventuringGear: [
    {
      name: 'Backpack',
      price: 5,
      id: '001',
      maxAllowed: 1
    },
    {
      name: 'Crowbar',
      price: 10,
      id: '002',
      maxAllowed: 1
    },
    {
      name: 'Garlic',
      price: 5,
      id: '003',
      maxAllowed: 2
    },
    {
      name: 'Grappling Hook',
      price: 25,
      id: '004',
      maxAllowed: 1
    },
    {
      name: 'Hammer (small)',
      price: 2,
      id: '005',
      maxAllowed: 1
    },
    {
      name: 'Holy Symbol',
      price: 25,
      id: '006',
      maxAllowed: 1
    },
    {
      name: 'HolyWater (vial)',
      price: 25,
      id: '007',
      maxAllowed: 3
    },
    {
      name: 'Iron Spikes (12)',
      price: 1,
      id: '008',
      maxAllowed: 1
    },
    {
      name: 'Lantern',
      price: 10,
      id: '009',
      maxAllowed: 1
    },
    {
      name: 'Mirror (hand sized, steel)',
      price: 5,
      id: '010',
      maxAllowed: 1
    },
    {
      name: 'Oil (1 flask)',
      price: 2,
      id: '011',
      maxAllowed: 3
    },
    {
      name: `Pole (10' long, wooden)`,
      price: 1,
      id: '012',
      maxAllowed: 1
    },
    {
      name: 'Rations (iron, 7 days)',
      price: 15,
      id: '013',
      maxAllowed: 2
    },
    {
      name: 'Rations (standard, 7 days)',
      price: 5,
      id: '014',
      maxAllowed: 2
    },
    {
      name: `Rope (50')`,
      price: 1,
      id: '015',
      maxAllowed: 2
    },
    {
      name: 'Sack (large)',
      price: 2,
      id: '016',
      maxAllowed: 2
    },
    {
      name: 'Sack (small)',
      price: 1,
      id: '017',
      maxAllowed: 3
    },
    {
      name: 'Stakes (3) and Mallet',
      price: 3,
      id: '018',
      maxAllowed: 1
    },
    {
      name: 'Thieves Tools',
      price: 25,
      id: '019',
      maxAllowed: 1
    },
    {
      name: 'Tinder Box (flint and steel)',
      price: 3,
      id: '020',
      maxAllowed: 1
    },
    {
      name: 'Torches (6)',
      price: 1,
      id: '021',
      maxAllowed: 2
    },
    {
      name: 'Waterskin',
      price: 1,
      id: '022',
      maxAllowed: 2
    },
    {
      name: 'Wine (2 pints)',
      price: 1,
      id: '023',
      maxAllowed: 3
    },
    {
      name: 'Wolfsbane (1 bunch)',
      price: 10,
      id: '024',
      maxAllowed: 2
    }
  ]
};
const osrShopLists = {
  items: [
    'Backpack',
    'Crowbar',
    'Garlic',
    'Grappling Hook',
    'Hammer (small)',
    'Holy Symbol',
    'Holy Water (vial)',
    'Iron Spikes (12)',
    'Lantern',
    'Mirror (hand sized, steel)',
    'Oil (1 flask)',
    `Pole (10' long, wooden)`,
    `Rations (iron, 7 days)`,
    `Rations (standard, 7 days)`,
    `Rope (50')`,
    'Sack (small)',
    'Sack (large)',
    'Stakes (3) and Mallet',
    'Thieves Tools',
    'Tinder Box (flint and steel)',
    'Torches (6)',
    'Waterskin',
    'Wine (2 pints)',
    'Wolfsbane (1 bunch)'
  ],
  weapons: [
    'Battle Axe',
    'Club',
    'Crossbow',
    'Dagger',
    'Halberd',
    'Hand Axe',
    'Javelin',
    'Lance',
    'Mace',
    'Longbow',
    'Shortbow',
    'Shortsword',
    'Silver Dagger',
    'Sling',
    'Spear',
    'Staff',
    'Sword',
    'Two-handed Sword',
    'Warhammer'
  ],
  armor: ['Chain Mail', 'Leather Armor', 'Plate Mail', 'Shield', 'Shield (Steel)', 'Shield (Wood)'],
  ammunition: ['Arrows (quiver of 20)', 'Crossbow bolts (case of 30)', 'Silver tipped arrow (1)']
};
const osrItemData = [
  { type: 'items', name: 'Backpack', cost: 5, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Crowbar', cost: 10, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Garlic', cost: 5, maxAllowed: 1 , qty: 3, stack: true},
  { type: 'items', name: 'Grappling Hook', cost: 25, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Hammer (small)', cost: 2, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Holy Symbol', cost: 25, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Holy Water (vial)', cost: 25, maxAllowed: 2 , qty: 1, stack: true},
  { type: 'items', name: 'Iron Spikes (12)', cost: 1, maxAllowed: 2 , qty: 12, stack: true},
  { type: 'items', name: 'Lantern', cost: 10, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Mirror (hand sized, steel)', cost: 5, maxAllowed: 1, qty: 1, stack: false },
  { type: 'items', name: 'Oil (1 flask)', cost: 2, maxAllowed: 3 , qty: 1, stack: true},
  { type: 'items', name: `Pole (10' long, wooden)`, cost: 1, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: `Rations (iron, 7 days)`, cost: 15, maxAllowed: 2 , qty: 7, stack: true},
  { type: 'items', name: `Rations (standard, 7 days)`, cost: 5, maxAllowed: 2 , qty: 7, stack: true},
  { type: 'items', name: `Rope (50')`, cost: 1, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Sack (small)', cost: 1, maxAllowed: 3, qty: 1, stack: false },
  { type: 'items', name: 'Sack (large)', cost: 2, maxAllowed: 2, qty: 1, stack: false },
  { type: 'items', name: 'Stakes (3) and Mallet', cost: 3, maxAllowed: 3 , qty: 3, stack: true},
  { type: 'items', name: 'Thieves Tools', cost: 25, maxAllowed: 1 },
  { type: 'items', name: 'Tinder Box (flint and steel)', cost: 3, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'items', name: 'Torches (6)', cost: 1, maxAllowed: 2 , qty: 6, stack: true},
  { type: 'items', name: 'Waterskin', cost: 1, maxAllowed: 3, qty: 1, stack: true },
  { type: 'items', name: 'Wine (2 pints)', cost: 1, maxAllowed: 3 , qty: 1, stack: true},
  { type: 'items', name: 'Wolfsbane (1 bunch)', cost: 10, maxAllowed: 2 , qty: 1, stack: true},
  { type: 'weapons', name: 'Battle Axe', cost: 7, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Club', cost: 3, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Crossbow', cost: 30, maxAllowed: 1, qty: 1, stack: false },
  { type: 'weapons', name: 'Dagger', cost: 3, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Halberd', cost: 7, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Hand Axe', cost: 4, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Javelin', cost: 1, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Lance', cost: 5, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Mace', cost: 5, maxAllowed: 1, qty: 1, stack: false },
  { type: 'weapons', name: 'Longbow', cost: 40, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Shortbow', cost: 25, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Shortsword', cost: 7, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Silver Dagger', cost: 30, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Sling', cost: 2, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Spear', cost: 4, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Staff', cost: 2, maxAllowed: 1, qty: 1, stack: false },
  { type: 'weapons', name: 'Sword', cost: 10, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Two-handed Sword', cost: 15, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'weapons', name: 'Warhammer', cost: 5, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'armor', name: 'Chain Mail', cost: 40, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'armor', name: 'Leather Armor', cost: 20, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'armor', name: 'Plate Mail', cost: 60, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'armor', name: 'Shield', cost: 10, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'armor', name: 'Shield (Steel)', cost: 10, maxAllowed: 1, qty: 1, stack: false },
  { type: 'armor', name: 'Shield (Wood)', cost: 10, maxAllowed: 1 , qty: 1, stack: false},
  { type: 'ammunition', name: 'Arrows (quiver of 20)', cost: 5, maxAllowed: 1 , qty:20, stack: false},
  { type: 'ammunition', name: 'Crossbow bolts (case of 30)', cost: 10, maxAllowed: 30 , qty: 1, stack: false},
  { type: 'ammunition', name: 'Silver tipped arrow (1)', cost: 5, maxAllowed: 1 , qty: 1, stack: false}
];
const shopListsA = {
  items: {
    everGreen: ['Backpack', 'Sack (small)', 'Sack (large)', 'Torches (6)'],
    randomize: [
      'Crowbar',
      'Garlic',
      'Grappling Hook',
      'Hammer (small)',
      'Holy Symbol',
      'HolyWater (vial)',
      'Iron Spikes (12)',
      'Lantern',
      'Mirror (hand sized, steel)',
      'Oil (1 flask)',
      `Pole (10' long, wooden)`,
      `Rations (iron, 7 days)`,
      `Rations (standard, 7 days)`,
      `Rope (50')`,
      'Stakes (3) and Mallet',
      'Thieves Tools',
      'Tinder Box (flint and steel)',
      'Waterskin',
      'Wine (2 pints)',
      'Wolfsbane (1 bunch)'
    ],
    min: 6
  },
  weapons: {
    everGreen: ['Sling', 'Spear', 'Dagger', 'Club', 'Staff'],
    randomize: [
      'Battle Axe',
      'Crossbow',
      'Halberd',
      'Hand Axe',
      'Holy Water Vial',
      'Javelin',
      'Lance',
      'Longbow',
      'Shortbow',
      'Shortsword',
      'Silver Dagger',
      'Sword',
      'Two-handed Sword',
      'Warhammer'
    ],
    min: 4
  },
  ammunition: {
    everGreen: ['Arrows (quiver of 20)', 'Crossbow bolts (case of 30)'],
    randomize: ['Silver tipped arrow (1)'],
    min: 0
  },
  armor: {
    evergreen: [],
    randomize: ['Chain Mail', 'Leather Armor', 'Plate Mail', 'Shield', 'Shield (Steel)', 'Shield(Wood)'],
    min: 4
  }
};
