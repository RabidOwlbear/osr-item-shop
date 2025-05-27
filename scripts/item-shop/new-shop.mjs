export class NewShopApp extends FormApplication {
  constructor() {
    super();
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('OSRIS.newShop.title'),
      classes: ['osris', 'osr-new-shop', 'item-shop'],
      width: 350,
      height: 300,
      // tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'buy' }],
      template: `modules/osr-item-shop/templateData/item-shop/new-item-shop.hbs`
    });
  }
  async getData() {}
  async activateListeners(html) {
    const shopName = html.find('#shopName')[0];
    const shopKeep = html.find('#shopKeep')[0];
    const folder = html.find('#folder')[0];
    const gold = html.find('#gold')[0];
    const remainder = html.find('#remainder')[0];
    const stockShop = html.find('#stockShop')[0];
    const randNum = html.find('#randNum')[0];
    const createBtn = html.find('#createBtn')[0];
    shopName.addEventListener('change', (ev) => {
      ev.preventDefault();
      if (shopName.value === '') {
        shopName.value = game.i18n.localize('OSRIS.newShop.title');
      }
    });
    folder.addEventListener('change', (ev) => {
      ev.preventDefault();
      if (folder.value === '') {
        folder.value = game.i18n.localize('OSRIS.newShop.customShops');
      }
    });
    gold.addEventListener('change', (ev) => {
      ev.preventDefault();
      if (gold.value === '') {
        gold.value = '800';
      }
      if (!parseInt(gold.value)) {
        gold.value = '800';
      }
      if (!(parseInt(gold.value) > parseInt(remainder.value))) {
        ui.notifications.warn(game.i18n.localize('OSRIS.newShop.remainderWarn'));
        gold.value = parseInt(remainder.value) + 10;
      }
    });
    remainder.addEventListener('change', (ev) => {
      ev.preventDefault();
      if (remainder.value === '') {
        remainder.value = '100';
      }
      if (!parseInt(remainder.value)) {
        remainder.value = '100';
      }
      if (!(parseInt(gold.value) > parseInt(remainder.value))) {
        ui.notifications.warn(game.i18n.localize('OSRIS.newShop.remainderWarn'));
        remainder.value = parseInt(gold.value) - 10;
      }
    });
    createBtn.addEventListener('click', (ev) => {
      ev.preventDefault();

      const data = {
        //initial gold amount
        gold: parseInt(gold.value),
        // how much gold to keep when randomly stocking
        remainder: parseInt(remainder.value),
        // stock the shop with a random selection of items
        stock: stockShop.checked,
        //  name of the shop actor
        shopKeep: shopKeep.value,
        //desired shop name
        name: shopName.value,
        // append a random number to the shop name
        appendNumber: randNum.checked,
        //custom shop actor folder name
        folderName: folder.value
      };

      OSRIS.shop.newItemShop(data);
      this.close();
    });
  }
}
export function renderNewShopApp() {
  if (game.user.isGM) {
    new OSRIS.shop.NewShop().render(true);
  } else {
    ui.notifications.notify('You do not have permission to use this feature.');
  }
}
