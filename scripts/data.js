
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


export async function registerUiButtons(){
  const osrhv2Active = game.modules.get('osr-helper-v2')?.active;
  const buttons = [
    {
      title: 'Item Shop',
      icon: 'fa-shop',
      app: 'item-shop'
    }
  ];
  if (game.user.isGM || !(await game.settings.get('osr-item-shop', 'gmOnlyShopConfig'))) {
    buttons.push({
      title: 'Shop Config',
      icon: 'fa-gear',
      app: 'shop-config'
    });
  }
  if(osrhv2Active){
    CONFIG.OSRH.CONST.sheetUI['actor'] = CONFIG.OSRH.CONST.sheetUI['actor'].concat(buttons);
  }else{
    OSRIS.ui = {
      actor: buttons
    } 
  }
  //ui buttons
  
}
