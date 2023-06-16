// Hooks.on('OSRIS Registered', 
export const registerOsrisData = ()=>{
OSRIS.osrItems = {
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
OSRIS.osrShopLists = {
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
// OSRIS.itemData = [
//   { source: 'osrItemShop', type: 'equipment', name: 'Backpack', cost: 5, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr001'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Crowbar', cost: 10, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr002'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Garlic', cost: 5, maxAllowed: 1 , qty: 3, stack: true, pack: 'osr-item-shop.osr items', id: 'osr003'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Grappling Hook', cost: 25, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr004'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Hammer (small)', cost: 2, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr005'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Holy Symbol', cost: 25, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr006'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Holy Water (vial)', cost: 25, maxAllowed: 2 , qty: 1, stack: true, pack: 'osr-item-shop.osr items', id: 'osr007'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Iron Spikes (12)', cost: 1, maxAllowed: 2 , qty: 12, stack: true, pack: 'osr-item-shop.osr items', id: 'osr008'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Lantern', cost: 10, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr009'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Mirror (hand sized, steel)', cost: 5, maxAllowed: 1, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr010'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Oil (1 flask)', cost: 2, maxAllowed: 3 , qty: 1, stack: true, pack: 'osr-item-shop.osr items', id: 'osr011'},
//   { source: 'osrItemShop', type: 'equipment', name: `Pole (10' long, wooden)`, cost: 1, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr012'},
//   { source: 'osrItemShop', type: 'equipment', name: `Rations (iron, 7 days)`, cost: 15, maxAllowed: 2 , qty: 7, stack: true, pack: 'osr-item-shop.osr items', id: 'osr013'},
//   { source: 'osrItemShop', type: 'equipment', name: `Rations (standard, 7 days)`, cost: 5, maxAllowed: 2 , qty: 7, stack: true, pack: 'osr-item-shop.osr items', id: 'osr014'},
//   { source: 'osrItemShop', type: 'equipment', name: `Rope (50')`, cost: 1, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr015'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Sack (small)', cost: 1, maxAllowed: 3, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr016'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Sack (large)', cost: 2, maxAllowed: 2, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr017'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Stakes (3) and Mallet', cost: 3, maxAllowed: 3 , qty: 3, stack: true, pack: 'osr-item-shop.osr items', id: 'osr018'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Thieves Tools', cost: 25, maxAllowed: 1 , pack: 'osr-item-shop.osr items', id: 'osr019'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Tinder Box (flint and steel)', cost: 3, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr020'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Torches (6)', cost: 1, maxAllowed: 2 , qty: 6, stack: true, pack: 'osr-item-shop.osr items', id: 'osr021'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Waterskin', cost: 1, maxAllowed: 3, qty: 1, stack: true , pack: 'osr-item-shop.osr items', id: 'osr022'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Wine (2 pints)', cost: 1, maxAllowed: 3 , qty: 1, stack: true, pack: 'osr-item-shop.osr items', id: 'osr023'},
//   { source: 'osrItemShop', type: 'equipment', name: 'Wolfsbane (1 bunch)', cost: 10, maxAllowed: 2 , qty: 1, stack: true, pack: 'osr-item-shop.osr items', id: 'osr024'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Battle Axe', cost: 7, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr025'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Club', cost: 3, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr026'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Crossbow', cost: 30, maxAllowed: 1, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr027'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Dagger', cost: 3, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr028'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Halberd', cost: 7, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr029'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Hand Axe', cost: 4, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr030'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Javelin', cost: 1, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr031'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Lance', cost: 5, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr032'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Mace', cost: 5, maxAllowed: 1, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr033'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Longbow', cost: 40, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr034'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Shortbow', cost: 25, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr035'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Shortsword', cost: 7, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr036'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Silver Dagger', cost: 30, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr037'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Sling', cost: 2, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr038'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Spear', cost: 4, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr039'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Staff', cost: 2, maxAllowed: 1, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr040'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Sword', cost: 10, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr041'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Two-handed Sword', cost: 15, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr042'},
//   { source: 'osrItemShop', type: 'weapons', name: 'Warhammer', cost: 5, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr043'},
//   { source: 'osrItemShop', type: 'armor', name: 'Chain Mail', cost: 40, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr045'},
//   { source: 'osrItemShop', type: 'armor', name: 'Leather Armor', cost: 20, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr046'},
//   { source: 'osrItemShop', type: 'armor', name: 'Plate Mail', cost: 60, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr047'},
//   { source: 'osrItemShop', type: 'armor', name: 'Shield', cost: 10, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr048'},
//   { source: 'osrItemShop', type: 'armor', name: 'Shield (Steel)', cost: 10, maxAllowed: 1, qty: 1, stack: false , pack: 'osr-item-shop.osr items', id: 'osr049'},
//   { source: 'osrItemShop', type: 'armor', name: 'Shield (Wood)', cost: 10, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr050'},
//   { source: 'osrItemShop', type: 'ammunition', name: 'Arrows (quiver of 20)', cost: 5, maxAllowed: 1 , qty:20, stack: false, pack: 'osr-item-shop.osr items', id: 'osr051'},
//   { source: 'osrItemShop', type: 'ammunition', name: 'Crossbow bolts (case of 30)', cost: 10, maxAllowed: 30 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr052'},
//   { source: 'osrItemShop', type: 'ammunition', name: 'Silver tipped arrow (1)', cost: 5, maxAllowed: 1 , qty: 1, stack: false, pack: 'osr-item-shop.osr items', id: 'osr053'},
//   { source: 'osrItemShop', type: 'ammunition', name: 'Sling Stones', cost: 1, maxAllowed: 1 , qty: 1, stack: true, pack: 'osr-item-shop.osr items', id: 'osr054'},

// ];
OSRIS.shopListsA = {
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

}
