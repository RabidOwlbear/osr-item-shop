import { OSRISApplication } from '../../osris-app.mjs';

export class ItemShopSelectV2 extends OSRISApplication {
  static DEFAULT_OPTIONS = {
    id: 'osr-item-shop-select',
    classes: ['osris', 'item-shop-select'],
    position: {
      width: 250,
      height: 300
    },
    tag: 'div', 
    window: {
      title: 'OSR Item Shop Select',
      icon: 'fas fa-shop',
      resizable: false
    }
  }; 
  static PARTS = {
    main: {
      template: 'modules/osr-item-shop/templateData/item-shop/item-shop-select.hbs'
    }
  };
  constructor(options = {}) {
    super(options);
    this.actorId = options.actorId || null;
    this.repos = options.position || null;
  }
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.actorId = this.actorId;
    context.shops = this._findActiveShops(this.actorId);
    return context;
  }
  _onRender(context, options) {
    super._onRender(context, options);
    if (this.repos) {
      this.position.left = this.repos.left;
      this.position.top = this.repos.top;
    }
    const shopBtns = [...this.element.querySelectorAll('a.shop-btn')];
    for (let btn of shopBtns) {
      btn.addEventListener('click', (ev) => this._openShop(ev));
    }
  }
  async _openShop(ev) {
    console.log(this.actorId, this);
    let customer = await game.actors.get(this.actorId);

    const linkedToken = customer.prototypeToken.actorLink;
    if (!linkedToken) {
      ui.notifications.warn(`${game.i18n.localize('OSRIS.notification.linkActorData')}`);
      return;
    }
    const customerGold = customer.items.getName(game.i18n.localize('OSRIS.curency.gp'));
    const customerSilver = customer.items.getName(game.i18n.localize('OSRIS.curency.sp'));
    const customerCopper = customer.items.getName(game.i18n.localize('OSRIS.curency.cp'));
    let el = ev.target.closest('a.shop-btn');
    let shopId = el.dataset.shopId;
    if (shopId == 'universal') {
      if (!customerGold) {
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.noGpItemFound'));
        return;
      }
      new OSRIS.shopClass({shop: 'universal', customer}).render(true);
      // new OSRIS.shopClass('universal', customer).render(true);
      this.close();
      return;
    }
    const shop = await game.actors.get(shopId);
    if (shop.getFlag('osr-item-shop', 'shopInUse')) {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.shopInUse'));
      return;
    }
    const shopGold = shop.items.getName(game.i18n.localize('OSRIS.curency.gp'));
    const shopSilver = shop.items.getName(game.i18n.localize('OSRIS.curency.sp'));
    const shopCopper = shop.items.getName(game.i18n.localize('OSRIS.curency.cp'));

    // if not universal shop, and no shop gold item, error out
    if (!shopGold) {
      ui.notifications.warn(
        `${game.i18n.localize('OSRIS.notification.noGpItemFound')} ${shop.name}, ${game.i18n.localize(
          'OSRIS.notification.cantOpenShopGp'
        )}`
      );
      return;
    }
    if (!shopSilver) {
      ui.notifications.warn(
        `${game.i18n.localize('OSRIS.notification.noSpItemFound')} ${shop.name}, ${game.i18n.localize(
          'OSRIS.notification.cantOpenShopSp'
        )}`
      );
      return;
    }
    if (!shopCopper) {
      ui.notifications.warn(
        `${game.i18n.localize('OSRIS.notification.noCpItemFound')} ${shop.name}, ${game.i18n.localize(
          'OSRIS.notification.cantOpenShopCp'
        )}`
      );
      return;
    }
    // if no gold item found error out
    if (!customerGold) {
      ui.notifications.warn(
        `${game.i18n.localize('OSRIS.notification.cantOpenShopGp')} ${customer.name}, ${game.i18n.localize(
          'OSRIS.notification.cantOpenShopGp'
        )}`
      );
      return;
    }
    if (!customerSilver) {
      ui.notifications.warn(
        `${game.i18n.localize('OSRIS.notification.noSpItemFound')} ${customer.name}, ${game.i18n.localize(
          'OSRIS.notification.cantOpenShopSp'
        )}`
      );
      return;
    }
    if (!customerCopper) {
      ui.notifications.warn(
        `${game.i18n.localize('OSRIS.notification.noCpItemFound')} ${customer.name}, ${game.i18n.localize(
          'OSRIS.notification.cantOpenShopCp'
        )}`
      );
      return;
    }
    new OSRIS.shopClass({shop, customer}).render(true);
    // new OSRIS.shopClass(shop, customer).render(true);
    if (game.user.isGM) {
      shop.setFlag('osr-item-shop', 'shopInUse', true);
    } else {
      let socketData = {
        type: 'actorFlag',
        data: {
          actorId: shopId,
          flag: 'shopInUse',
          flagData: true,
          type: 'set'
        }
      };
      game.socket.emit('module.osr-item-shop', socketData);
    }
    //set open shop flag on user
    game.user.setFlag('osr-item-shop', 'shopOpen', { shopId: shopId });
    this.close();
    return;
  }
  _findActiveShops(actorId = null) {
    let actors = game.actors.filter((a) => a?.flags['osr-item-shop']?.shopConfig?.enabled == true);
    const shops = [];
    if (game.settings.get('osr-item-shop', 'universalShopActive')) {
      shops.push({
        id: 'universal',
        name: 'Universal Item Shop'
      });
    }
    for (let a of actors) {
      if (a.id != actorId) {
        shops.push({
          id: a.id,
          name: a.flags['osr-item-shop'].shopConfig.shopName
        });
      }
    }
    return shops;
  }
}
