import { OSRISApplication } from '../../osris-app.mjs';

export class ItemShopConfigV2 extends OSRISApplication {
  static DEFAULT_OPTIONS = {
    id: 'osr-item-shop-config',
    classes: ['osris', 'item-shop-config'],
    position: {
      width: 200,
      height: 230
    },
    tag: 'div',
    window: {
      title: 'OSR Item Shop Config',
      icon: 'fas fa-wrench-simple',
      resizable: false
    },
  };
  static PARTS = {
    main: {
      template: 'modules/osr-item-shop/templateData/item-shop/custom-shop-config.hbs'
    }
  };
  constructor(options = {}) { 
    super(options);
    this.uuid = options.uuid || null;
    this.repos = options.position || null;
  }
  async _prepareContext(options) {  
    const context = await super._prepareContext(options);
    const actor = await fromUuid(this.uuid);
    context.actorId = this.actorId;
    context.actor = actor;
    context.shopEnabled = actor.getFlag('osr-item-shop', 'shopConfig')?.enabled || false;
    context.shopName = context.actor.getFlag('osr-item-shop', 'shopConfig')?.shopName || context.actor.name + ' ' + game.i18n.localize('OSRIS.itemShop.customShop');
    return context;
  }
  _onRender(context, options) {
    super._onRender(context, options);
    const html = this.element;
    const shopActive = html.querySelector('#actorShopActive');
    const shopName = html.querySelector('#shopName');
    const updateBtn = html.querySelector('.update-shop-config-btn');
    shopName.addEventListener('blur', (e) => {
      e.preventDefault();
      if (shopName.value === '') {
        shopName.value = this.actor.name + ' shop';
      }
      if (shopActive.checked && !shopName.value.length) {
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.enterShopName'));
      }
    });
    updateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const actor = await fromUuid(this.uuid);
      if (shopName.value === '') {
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.enterShopName'));
        return;
      }
      actor.setFlag('osr-item-shop', 'shopConfig', {
        enabled: shopActive.checked,
        shopName: shopName.value
      });
      ui.notifications.notify(game.i18n.localize('OSRIS.notification.shopConfigUpdate'));
      this.close();
    });
  }
}

