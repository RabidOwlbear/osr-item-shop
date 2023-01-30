export function registerSettings(){

  game.settings.register('osr-item-shop', 'charBuilderCheck', {
    name: 'Add open shop checkbox to OSE character builder (if installed)',
    hint: 'Adds option to open item shop following character creation using the OSE character builder included  with the Old-School-Essentials module.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  
  game.settings.register('osrItemShop', 'sourceList', {
    name: 'sourceList',
    type: Array,
    default: [],
    scope: 'world'
  });
  game.settings.register('osrItemShop', 'itemList', {
    name: 'itemList',
    type: Array,
    default: [],
    scope: 'world'
  });
  game.settings.register('osr-item-shop', 'universalShopCompendium', {
    name: 'Universal Shop Compendium',
    hint: 'Item Compendium used to stock the Universal Item Shop. Name must be lowercase, substituting dashes for spaces. The name must match the desired item compendium name.',
    scope: 'world',
    type: String,
    default: 'OSR Items',
    config: true
  });
  game.settings.register('osr-item-shop', 'universalShopActive', {
    name: 'Activate Universal Item Shop',
    hint: 'Adds Universal Item Shop to item shop select lists.',
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register('osr-item-shop', 'shopConfigTab', {
    name: 'Add Item Shop config tab to character sheets.',
    hint: 'Adds an OSRIS tab to the character sheet containing item shop configuration options.',
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register('osr-item-shop', 'gmOnlyCharConfig', {
    name: 'Hide Shop Configuration Tab',
    hint: 'Hides the Item Shop configuration tab on character sheets for non GM users.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
}