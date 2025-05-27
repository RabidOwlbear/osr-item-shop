export class ItemShopConfig extends FormApplication {
  constructor(actor = null) {
    super();
    this.actor = actor;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: 'Item Shop Select',
      classes: ['osris', 'item-shop-config'],
      width: 250,
      height: 300,
      template: `modules/osr-item-shop/templateData/config-tab/config-tab.hbs`
    });
  }
  async getData() {
    const context = super.getData();

    context.actor = await game.actors.get(this.actor._id);
    const flagData = await context.actor.getFlag('osr-item-shop', 'shopConfig');
    context.shopEnabled = flagData?.enabled || false;
    context.shopName = flagData?.shopName || this.actor.name + ' ' + game.i18n.localize('OSRIS.itemShop.customShop');
    return context;
  }
  async activateListeners(html) {
    const shopName = html.find('#shopName')[0];
    const saveBtn = html.find('.update-shop-config-btn')[0];
    const shopEnabled = html.find('#actorShopActive')[0];
    shopName.addEventListener('change', (e) => {
      e.preventDefault();
      if (shopName.value === '') {
        shopName.value = this.actor.name + ' shop';
      }
    });
    saveBtn.addEventListener('click', (e) => {
      e.preventDefault();

      this._setFlagData({
        shopName: shopName.value,
        enabled: shopEnabled.checked
      });
    });
  }
  async _setFlagData(data) {
    const actorObj = await game.actors.get(this.actor._id);
    await actorObj.setFlag('osr-item-shop', 'shopConfig', data);
    ui.notifications.notify(game.i18n.localize('OSRIS.notification.shopConfigUpdate'));
    this.close();
  }
}
