export const preloadHandlebarsTemplates = async function(){
  return loadTemplates([
    "modules/osr-item-shop/templateData/item-shop/partials/shop-header.hbs",
    "modules/osr-item-shop/templateData/item-shop/partials/shop-footer.hbs",
    "modules/osr-item-shop/templateData/item-shop/partials/buy-tab.hbs",
    "modules/osr-item-shop/templateData/item-shop/partials/actor-buy-tab.hbs",
    "modules/osr-item-shop/templateData/item-shop/partials/sell-tab.hbs",
    "modules/osr-item-shop/templateData/item-shop/partials/pack-tab.hbs",
    "modules/osr-item-shop/templateData/item-shop/partials/header.hbs",
    "modules/osr-item-shop/templateData/config-tab/config-tab.hbs"
  ])
}