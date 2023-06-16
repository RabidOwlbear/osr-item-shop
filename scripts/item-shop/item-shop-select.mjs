export class ItemShopSelectForm extends FormApplication {
  constructor(actorId = null) {
    super();
    this.actorId = actorId;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: 'Item Shop Select',
      classes: ['osris', 'item-shop-select'],
      width: 250,
      height: 300,
      template: `modules/osr-item-shop/templateData/item-shop/item-shop-select.hbs`
    });
  }
  getData() {
    const context = super.getData();
    context.actorId = this.actorId;
    context.shops = this._findActiveShops(this.actorId);
    return context;
  }
  activateListeners(html) {
    const shopBtns = html.find('a.shop-btn');
    for (let btn of shopBtns) {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        this._openShop(ev);
      });
    }
  }
  async _openShop(ev) {
    let customer = await game.actors.get(this.actorId);
    const customerGold = customer.items.getName(game.i18n.localize("OSRIS.curency.gp"));
    let el = ev.target.closest('a.shop-btn');
    let shopId = el.dataset.shopId;
    if (shopId == 'universal') {
      if(!customerGold){
        ui.notifications.warn(game.i18n.localize("OSRIS.notification.noGpItemFound"));
        return;
      }
      new OSRIS.shopClass('universal', customer).render(true);
      this.close();
      return;
    }
    const shop = await game.actors.get(shopId);
    if (shop.getFlag('osr-item-shop', 'shopInUse')) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.shopInUse"));
      return;
    }
    const shopGold = shop.items.getName(game.i18n.localize("OSRIS.curency.gp"));
    // if not universal shop, and no shop gold item, error out
    if (!shopGold) {
      ui.notifications.warn(`${game.i18n.localize("OSRIS.notification.noGpItemFound")} ${shop.name}, ${game.i18n.localize("OSRIS.notification.cantOpenShopGp")}`);
      return;
    }
    // if no gold item found error out
    if (!customerGold) {
      ui.notifications.warn(`${game.i18n.localize("OSRIS.notification.cantOpenShopGp")} ${customer.name}, ${game.i18n.localize("OSRIS.notification.cantOpenShopGp")}`);
      return;
    }

    new OSRIS.shopClass(shop, customer).render(true);
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
    game.user.setFlag('osr-item-shop', 'shopOpen', {shopId: shopId})
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
