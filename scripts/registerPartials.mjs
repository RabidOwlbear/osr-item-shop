export const preloadHandlebarsTemplates = async function () {
  const templates = [
    'modules/osr-item-shop/templateData/item-shop/partials/shop-header.hbs',
    'modules/osr-item-shop/templateData/item-shop/partials/shop-footer.hbs',
    'modules/osr-item-shop/templateData/item-shop/partials/buy-tab.hbs',
    'modules/osr-item-shop/templateData/item-shop/partials/actor-buy-tab.hbs',
    'modules/osr-item-shop/templateData/item-shop/partials/sell-tab.hbs',
    'modules/osr-item-shop/templateData/item-shop/partials/pack-tab.hbs',
    'modules/osr-item-shop/templateData/item-shop/partials/header.hbs',
    'modules/osr-item-shop/templateData/config-tab/config-tab.hbs'
  ]
  const data = game.version < 13 ? loadTemplates(templates) : foundry.applications.handlebars.loadTemplates(templates);
  return data;
};
