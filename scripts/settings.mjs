export function registerSettings(){

  game.settings.register('osr-item-shop', 'charBuilderCheck', {
    name: "OSRIS.settings.builderCheck",
    hint: "OSRIS.settings.builderCheckHint",
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
  
  game.settings.register('osr-item-shop', 'universalShopActive', {
    name: "OSRIS.settings.activateUniversalShop",
    hint: "OSRIS.settings.activateUniversalShopHint",
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register('osr-item-shop', 'shopConfigTab', {
    name: "OSRIS.settings.addConfigTab",
    hint: "OSRIS.settings.addConfigTabHint",
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });
  game.settings.register('osr-item-shop', 'gmOnlyShopConfig', {
    name: "OSRIS.settings.hideConfig",
    hint: "OSRIS.settings.hideConfigHint",
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register('osr-item-shop', 'hidePacksTab', {
    name: "OSRIS.settings.hidePacksTab",
    hint: "OSRIS.settings.hidePacksTabHint",
    scope: 'world',
    type: Boolean,
    default: false,
    config: true
  });
  //  // hide foreign language packs
  //  game.settings.register('osr-item-shop', 'hideForeignPacks', {
  //   name: "OSRIS.settings.hideForeignPackName",
  //   hint: "OSRIS.settings.hideForeignPackHint",
  //   scope: 'client',
  //   type: Boolean,
  //   default: true,
  //   config: true
  // });
  // game.settings.register('osr-item-shop', 'makePackFolder', {
  //   name: "OSRIS.settings.makePackFolder",
  //   hint: "OSRIS.settings.makePackFolderHint",
  //   scope: 'client',
  //   type: Boolean,
  //   default: true,
  //   config: true
  // });
  game.settings.register('osr-item-shop', 'packFolderName', {
    name: "OSRIS.settings.packFolderName",
    hint: "OSRIS.settings.packFolderNameHint",
    scope: 'world',
    type: String,
    default: 'OSRIS Compendiums',
    config: true
  });
}
export function registerReadySettings(){
  game.settings.register('osr-item-shop', 'universalShopCompendium', {
    name: "OSRIS.settings.universalComp",
    hint: "OSRIS.settings.universalCompHint",
    scope: 'world',
    type: String,
    choices: getPackOptions(),
    default: `osr-item-shop.osr-items-${game.i18n.lang}`,
    config: true
  });

}
function getPackOptions(){
  let options = {};
  game.packs.map(a=>{
    if(a.metadata.type === 'Item'){
      options[a.metadata.id] = a.metadata.label;
    }
  })
  return options
}
