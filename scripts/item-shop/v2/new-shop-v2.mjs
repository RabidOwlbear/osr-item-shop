import { OSRISApplication } from '../../osris-app.mjs';

export class NewShopV2 extends OSRISApplication {
  static DEFAULT_OPTIONS = {
    id: 'osr-new-shop-v2',
    classes: ['osris', 'osr-new-shop'],
    title: 'New Item Shop',
    tag: 'div',
    window: {
      title: 'OSRIS.newShop.title',
      icon: 'fas fa-cart-shopping',
      resizable: false
    },
    position: {
      width: 350,
      height: 300,
    } 
  }

static PARTS = {
  main: {
      template: 'modules/osr-item-shop/templateData/item-shop/new-item-shop.hbs'
    }
  }
  constructor(options = {}) {
    super(options);
  }
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    return context;
  }
  _onRender(context, options) {
    super._onRender(context, options);
    const html = this.element;
    const shopName = html.querySelector('#shopName');
    const shopKeep = html.querySelector('#shopKeep');
    const folder = html.querySelector('#folder');
    const gold = html.querySelector('#gold');
    const remainder = html.querySelector('#remainder');
    const stockShop = html.querySelector('#stockShop');
    const randNum = html.querySelector('#randNum');
    const createBtn = html.querySelector('#createBtn');
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


