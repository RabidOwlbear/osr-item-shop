import { OSRISApplication } from '../../osris-app.mjs';

export class ItemShopV2 extends OSRISApplication {
  static DEFAULT_OPTIONS = {
    id: 'osr-item-shop',
    classes: ['osr-item-shop', 'item-shop'],
    position: {
      width: 500,
      height: 620
    },
    tag: 'div',
    window: {
      title: 'OSR Item Shop',
      icon: 'fas fa-cart-shopping',
      resizable: false
    },
    tabs: [
      {
        navSelector: '.tabs',
        contentSelector: '.tab-content',
        initial: 'buy'
      }
    ],
    // Enable automatic scroll position preservation
    preserveScrollPositions: true
  };
  static PARTS = {
    header: {
      template: 'modules/osr-item-shop/templateData/item-shop/v2/shop-header.hbs'
    },
    nav: {
      template: 'modules/osr-item-shop/templateData/item-shop/v2/shop-nav.hbs'
    },
    buy: {
      template: 'modules/osr-item-shop/templateData/item-shop/v2/buy-tab.hbs'
    },
    sell: {
      template: 'modules/osr-item-shop/templateData/item-shop/v2/sell-tab.hbs'
    },
    packs: {
      template: 'modules/osr-item-shop/templateData/item-shop/v2/pack-tab.hbs'
    }
  };
  constructor(options = {}) {
    super(options);
    this.shop = options.shop || 'universal';
    this.customer = options.customer || null;
  }
  async _prepareContext(options) {
    const universalShop = this.shop == 'universal';
    let context = await super._prepareContext(options);
    context = await foundry.utils.mergeObject(context, {
      tabs: this._getTabs(options.parts),
      shop: this.shop,
      customer: this.customer,
      universalShop: universalShop,
      shopItems: this.shop == 'universal' ? await this._getItems() : await this._getItems(this.shop),
      custItems: await this._getItems(this.customer),
      hidePacks: await game.settings.get('osr-item-shop', 'hidePacksTab'),
      shopName: '',
      shopImg: this.shop == 'universal' ? 'modules/osr-item-shop/img/owlbear.webp' : this.shop.img,
      shopLabel: `${game.i18n.localize('OSRIS.itemShop.shopKeep')}:`,
      custImg: this.customer.img,
      customerName: this.customer.name,
      customerGold: this.customer.items.getName(game.i18n.localize('OSRIS.curency.gp'))?.system?.quantity?.value
    });
    if (universalShop) {
      context.shopName = game.i18n.localize('OSRIS.shopSelect.universalShop');
    } else {
      const flagName = this.shop.flags?.['osr-item-shop']?.shopConfig?.shopName;
      const shopGpItem = this.shop.items.getName(game.i18n.localize('OSRIS.curency.gp'));
      context.shopName = flagName ? flagName : this.shop.name;
      context.shopGold = shopGpItem?.system?.quantity?.value;
      context.shopKeep = this.shop.name;
    }
    return context;
  }
  _onRender(context, options) {
    // super._onRender(context, options);
    this._forceTabInit(context.tabs);

    const html = this.element;
    const buyTotal = html.querySelector('#buy-total');
    const sellTotal = html.querySelector('#sell-total');
    const buyBtnPlus = html.querySelectorAll(`.buy.plus`);
    const buyBtnMinus = html.querySelectorAll(`.buy.minus`);
    const buyBtn = html.querySelector('#buy-btn');
    const sellBtn = html.querySelector('#sell-btn');
    const sellCheckList = html.querySelectorAll('.sell-check');
    const buyCheckList = html.querySelectorAll('.buy-check');
    const buyPackBtn = html.querySelector('.buy-pack-btn');
    for (let p of buyBtnPlus) {
      p.addEventListener('click', (ev) => this._addQty(ev, html, 'buy'));
    }
    for (let m of buyBtnMinus) {
      m.addEventListener('click', (ev) => this._subQty(ev, html, 'buy'));
    }
    for (let cb of sellCheckList) {
      cb.addEventListener('change', (ev) => this._handleCheckBoxes(ev, 'sell', sellTotal));
    }
    for (let cb of buyCheckList) {
      cb.addEventListener('change', (ev) => this._handleCheckBoxes(ev, 'buy', buyTotal));
    }
    buyBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (this.shop == 'universal') {
        this._universalPurchase(html);
      } else {
        this._shopTransaction('buy', html, this.shop, this.customer);
      }
    });
    sellBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      if (this.shop == 'universal') {
        this._universalSale(html);
      } else {
        this._shopTransaction('sell', html, this.shop, this.customer);
      }
    });
    buyPackBtn?.addEventListener('click', async (ev) => {
      ev.preventDefault();
      const packEl = [...html.querySelectorAll('.pack-select')].filter((i) => i.checked);
      const packSelection = packEl[0].value;
      await this._handleFastPack(packSelection, this.customer._id);
      this.render();
    });
  }
  async _getItems(actor = null) {
    let items = [];
    const itemObj = {};
    if (actor) {
      items = this._filterActorItems(actor);
    } else {
      const packName = await game.settings.get('osr-item-shop', 'universalShopCompendium');
      let pack = await game.packs.get(packName);
      // if (!pack) pack = await game.packs.get(`world.${packName}`);
      if (!pack) {
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.universalPackNotFound'));
        return;
      }
      let contents = await pack.getDocuments();
      let itemList = contents.filter((i) => i.name !== '#[CF_tempEntity]');
      items = this._filterItems(itemList);
    }
    itemObj.items = items.filter((i) => i.type == 'item').sort(this._sortAlpha);
    itemObj.weapons = items.filter((i) => i.type == 'weapon').sort(this._sortAlpha);
    itemObj.armor = items.filter((i) => i.type == 'armor').sort(this._sortAlpha);
    return itemObj;
  }

  close() {
    if (this.shop != 'universal') {
      if (game.user.isGM) {
        this.shop.unsetFlag('osr-item-shop', 'shopInUse');
      } else {
        game.socket.emit('module.osr-item-shop', {
          type: 'actorFlag',
          data: { actorId: this.shop._id, flag: 'shopInUse', flagData: null, type: 'unset' }
        });
      }
    }
    super.close();
  }
  _getTabs(parts) {
    const tabGroup = 'primary';
    const intialTab = this.options.tabs[0].initial;
    const tabData = {};
    const universalShop = this.shop == 'universal';
    const tabs = universalShop ? ['buy', 'sell', 'packs'] : ['buy', 'sell'];
    // Default tab for first time it's rendered this session
    if (!this.tabGroups.primary) this.tabGroups.primary = intialTab;
    for (let opt of parts) {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'OSRIS.itemShop.'
      };
      //move to constructor
      switch (opt) {
        case 'buy':
          tab.id = 'buy';
          tab.label += 'buy';
          break;
        case 'sell':
          tab.id = 'sell';
          tab.label += 'sell';
          break;
        case 'packs':
          tab.id = 'packs';
          tab.label += 'packs';
          break;
      }
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      if (tabs.includes(opt)) {
        tabData[opt] = tab;
      }
    }
    return tabData;
  }
  _sortAlpha(a, b) {
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  }
  _filterActorItems(actor) {
    const currency = [
      game.i18n.localize('OSRIS.curency.gp'),
      game.i18n.localize('OSRIS.curency.pp'),
      game.i18n.localize('OSRIS.curency.cp'),
      game.i18n.localize('OSRIS.curency.ep'),
      game.i18n.localize('OSRIS.curency.sp')
    ];
    const types = ['weapon', 'item', 'armor'];
    const items = actor.items.filter((i) => !currency.includes(i.name) && types.includes(i.type));
    return items;
  }
  _filterItems(items) {
    const currency = [
      game.i18n.localize('OSRIS.curency.gp'),
      game.i18n.localize('OSRIS.curency.pp'),
      game.i18n.localize('OSRIS.curency.cp'),
      game.i18n.localize('OSRIS.curency.ep'),
      game.i18n.localize('OSRIS.curency.sp')
    ];
    const types = ['weapon', 'item', 'armor'];
    items = items.filter((i) => !currency.includes(i.name) && types.includes(i.type));
    return items;
  }
  _clearCart(html) {
    const sellCheck = html.querySelectorAll('.sell-check');
    const buyCheck = html.querySelectorAll('.buy-check');
    for (let cb of sellCheck) {
      cb.checked = false;
    }
    for (let cb of buyCheck) {
      cb.checked = false;
    }
  }
  _addQty(ev, html, type) {
    ev.preventDefault();
    const buyEl = html.querySelector('#buy-total');
    const sellEl = html.querySelector('#sell-total');
    const buyTotal = parseFloat(buyEl.value);
    const sellTotal = parseFloat(sellEl.value);
    let itemEl = ev.target.closest('.item');
    let qtyEl = itemEl.querySelector('.item-qty');
    let cost = parseFloat(itemEl.dataset.cost);
    let newTotal = buyTotal + cost;
    qtyEl.value = `${parseInt(qtyEl.value) + 1}`;
    if (type == 'buy') {
      buyEl.value = newTotal;
    }
    if (type == 'sell') {
      sellEl.value = newTotal;
    }
  }
  _subQty(ev, html, type) {
    ev.preventDefault();
    const buyEl = html.querySelector('#buy-total');
    const buyTotal = parseFloat(buyEl.value);
    const sellEl = html.querySelector('#sell-total');
    let itemEl = ev.target.closest('.item');
    let qtyEl = ev.target.closest('.item').querySelector('.item-qty');
    let qty = parseInt(qtyEl.value);
    let cost = parseFloat(itemEl.dataset.cost);
    // if quantity is 1 or higher, deduct cost from total
    let newTotal = qty > 0 ? parseFloat(buyTotal) - cost : parseFloat(buyTotal);
    let newQty = qty - 1 < 0 ? 0 : qty - 1;
    qtyEl.value = `${newQty}`;
    if (type == 'buy') {
      buyEl.value = newTotal < 0 ? 0 : newTotal;
    }
    if (type == 'sell') {
      sellEl.value = newTotal < 0 ? 0 : newTotal;
    }
  }
  _handleQty(ev, type, html) {
    ev.preventDefault();

    if (type == 'add') {
      let qtyEl = ev.target.closest('.item').querySelector('.item-qty');
      let cost = qtyEl.dataset.cost;
      qtyEl.value = `${parseInt(qtyEl.value) + 1}`;

      buyTotal;
    }
    if (type == 'sub') {
      let qtyEl = ev.target.closest('.item').querySelector('.item-qty');
      let cost = qtyEl.dataset.cost;
      let value = parseInt(qtyEl.value) - 1 < 0 ? 0 : parseInt(qtyEl.value) - 1;
      qty.value = `${value}`;
    }
  }
  _handleCheckBoxes(ev, type, el) {
    ev.preventDefault();
    let checked = ev.target.checked;
    let itemEl = ev.target.closest('.item');
    let dataset = itemEl.dataset;
    if (checked) {
      const total = parseFloat(el.value) + parseFloat(dataset.cost);
      el.value = total;
    }
    if (!checked) {
      const total = parseFloat(el.value) - parseFloat(dataset.cost);
      el.value = total;
    }
  }
  async _getCurrencyItems(type) {
    const itemPack =
      game.system.id === 'ose'
        ? await game.packs.get(`osr-item-shop.osr-items-${game.i18n.lang}`)
        : await game.packs.get(`osr-item-shop.osr-items-${game.system.id}-${game.i18n.lang}`);
    const gpString = game.i18n.localize('OSRIS.curency.gp');
    const spString = game.i18n.localize('OSRIS.curency.sp');
    const cpString = game.i18n.localize('OSRIS.curency.cp');
    let gpItem;
    let spItem;
    let cpItem;
    const makeItem = async (str, actor) => {
      const itemData = foundry.utils.deepClone(await itemPack.getDocument(itemPack.index.getName(str)._id));
      await actor.createEmbeddedDocuments('Item', [itemData]);
      return await actor.items.getName(str);
    };
    switch (type) {
      case 'customer':
        gpItem = await this.customer.items.getName(gpString);
        spItem = await this.customer.items.getName(spString);
        cpItem = await this.customer.items.getName(cpString);
        if (!spItem && game.user.isGM) {
          spItem = await makeItem(spString, this.customer);
        }
        if (!cpItem && game.user.isGM) {
          cpItem = await makeItem(cpString, this.customer);
        }
        return {
          gp: gpItem,
          sp: spItem,
          cp: cpItem
        };
      case 'shop':
        gpItem = await this.shop.items.getName(gpString);
        spItem = await this.shop.items.getName(spString);
        cpItem = await this.shop.items.getName(cpString);
        if (!spItem && game.user.isGM) {
          spItem = await makeItem(spString, this.shop);
        }
        if (!cpItem && game.user.isGM) {
          cpItem = await makeItem(cpString, this.shop);
        }
        return {
          gp: gpItem,
          sp: spItem,
          cp: cpItem
        };
    }
  }
  _getCurrAmts(amt, type = 'buy') {
    let amtStr = `${amt}`.split('.');
    let changeStr = amtStr[1] || '';
    let gp = parseInt(amtStr[0]);
    let sp = 0;
    let cp = 0;
    if (changeStr.length) {
      if (type == 'buy') {
        let rem = (1 - parseFloat(`0.${changeStr}`)) * 100;
        let amt = `${rem}`;
        sp = parseInt(amt[0]);
        cp = Math.round(amt.slice(1));
      } else {
        sp = parseInt(changeStr[0]);
        cp = Math.round(changeStr.slice(1));
      }
    }
    if (type == 'buy' && changeStr.length) gp += 1;
    return { gp: gp, sp: sp, cp: cp };
  }
  async _universalPurchase(html) {
    let packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
    let pack = await game.packs.get(packName);
    // if (!pack) pack = await game.packs.get(`world.${packName}`);
    if (!pack) {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.universalPackNotFound'));
      return;
    }
    let itemList = [];
    let qtyEls = [...html.querySelectorAll('.item-qty')];
    qtyEls.map((i) => {
      if (parseInt(i.value) >= 1) {
        itemList.push({
          itemId: i.dataset.itemId,
          itemName: i.dataset.itemName,
          qty: parseInt(i.value)
        });
      }
    });
    let purchaseTotal = parseFloat(html.querySelector('#buy-total').value);
    let currItemObj = await this._getCurrencyItems('customer');
    const currAmts = this._getCurrAmts(purchaseTotal);
    let gpItem = currItemObj.gp;
    let spItem = currItemObj.sp;
    let cpItem = currItemObj.cp;

    if (itemList.length) {
      if (purchaseTotal <= gpItem.system.quantity.value) {
        let updatedGp = gpItem.system.quantity.value - currAmts.gp;
        let updatedSp = spItem.system.quantity.value + currAmts.sp;
        let updatedCp = cpItem.system.quantity.value + currAmts.cp;
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.creatingItemsActor'));
        for (let item of itemList) {
          let itemData = await pack.getDocument(item.itemId);

          for (let i = 0; i < item.qty; i++) {
            await this.customer.createEmbeddedDocuments('Item', [itemData]);
          }
        }
        await gpItem.update({ system: { quantity: { value: updatedGp } } });
        if (updatedSp) await spItem.update({ system: { quantity: { value: updatedSp } } });
        if (updatedCp) await cpItem.update({ system: { quantity: { value: updatedCp } } });
        ui.notifications.notify(game.i18n.localize('OSRIS.notification.createItemsComplete'));
        this.render();
      } else {
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.insuffGold'));
        this.render();
      }
    } else {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.noItems'));
    }

    // OSRIS.socket.transactionComplete({id:game.user.id, appId: this.appId})
  }
  async _universalSale(html) {
    let currItemObj = await this._getCurrencyItems('customer');
    let transactionTotal = 0;
    let sellChecks = [...html.querySelectorAll('input.sell-check')].filter((i) => i.checked);
    let gp = currItemObj.gp.system.quantity.value;
    let sp = currItemObj.sp.system.quantity.value;
    let cp = currItemObj.cp.system.quantity.value;

    let items = sellChecks.map((i) => {
      let item = i.closest('.item').dataset;
      return {
        type: item.type,
        id: item.id,
        cost: parseFloat(item.cost)
      };
    });
    items.map((i) => (transactionTotal += i.cost));
    for (let item of items) {
      let itemObj = await this.customer.items.get(item.id);
      await itemObj.delete();
    }
    const currAmts = this._getCurrAmts(transactionTotal, 'sell');
    await currItemObj.gp.update({ system: { quantity: { value: gp + currAmts.gp } } });
    if (sp) {
      await currItemObj.sp.update({ system: { quantity: { value: sp + currAmts.sp } } });
    }
    if (cp) {
      await currItemObj.cp.update({ system: { quantity: { value: cp + currAmts.cp } } });
    }
    this.render();
  }
  async _shopTransaction(transactionType, html, shop, customer) {
    const customerCurr = await this._getCurrencyItems('customer');
    const shopCurr = await this._getCurrencyItems('shop');
    let customerGold = customerCurr.gp.system.quantity.value; //customer.items.getName(game.i18n.localize('OSRIS.curency.gp')).system.quantity.value;
    let shopGold = shopCurr.gp.system.quantity.value; //shop.items.getName(game.i18n.localize('OSRIS.curency.gp')).system.quantity.value;
    let transactionTotal = 0;
    let items;
    let type;
    let newGP;
    let newCurr;
    let currAmts;
    switch (transactionType) {
      case 'buy':
        type = 'buy';
        let buyChecks = [...html.querySelectorAll('input.buy-check')].filter((i) => i.checked);
        items = buyChecks.map((i) => {
          let item = i.closest('.item').dataset;
          return {
            type: item.type,
            id: item.id,
            cost: parseFloat(item.cost)
          };
        });
        items.map((i) => (transactionTotal += i.cost));
        if (transactionTotal > customerGold) {
          ui.notifications.warn(game.i18n.localize('OSRIS.notification.insuffGold'));
          return;
        }
        currAmts = {
          shop: this._getCurrAmts(transactionTotal, 'sell'),
          customer: this._getCurrAmts(transactionTotal, 'buy')
        };
        newCurr = {
          shop: {
            gp: shopCurr.gp.system.quantity.value + currAmts.shop.gp,
            sp: shopCurr.sp.system.quantity.value + currAmts.shop.sp,
            cp: shopCurr.cp.system.quantity.value + currAmts.shop.cp
          },
          customer: {
            gp: customerCurr.gp.system.quantity.value - currAmts.customer.gp,
            sp: customerCurr.sp.system.quantity.value + currAmts.customer.sp,
            cp: customerCurr.cp.system.quantity.value + currAmts.customer.cp
          }
        };
        newGP = {
          shop: shopGold + transactionTotal,
          customer: customerGold - transactionTotal
        };
        break;
      case 'sell':
        type = 'sell';
        let sellChecks = [...html.querySelectorAll('input.sell-check')].filter((i) => i.checked);
        items = sellChecks.map((i) => {
          let item = i.closest('.item').dataset;
          return {
            type: item.type,
            id: item.id,
            cost: parseFloat(item.cost)
          };
        });
        items.map((i) => (transactionTotal += i.cost));
        if (transactionTotal > shopGold) {
          ui.notifications.warn(game.i18n.localize('OSRIS.notification.insuffShopGold'));
          return;
        }
        currAmts = {
          shop: this._getCurrAmts(transactionTotal, 'buy'),
          customer: this._getCurrAmts(transactionTotal, 'sell')
        };
        newCurr = {
          shop: {
            gp: shopCurr.gp.system.quantity.value - currAmts.shop.gp,
            sp: shopCurr.sp.system.quantity.value + currAmts.shop.sp,
            cp: shopCurr.cp.system.quantity.value + currAmts.shop.cp
          },
          customer: {
            gp: customerCurr.gp.system.quantity.value + currAmts.customer.gp,
            sp: customerCurr.sp.system.quantity.value + currAmts.customer.sp,
            cp: customerCurr.cp.system.quantity.value + currAmts.customer.cp
          }
        };
        newGP = {
          shop: shopGold - transactionTotal,
          customer: customerGold + transactionTotal
        };
        break;
    }
    let transactionData = {
      userId: game.user.id,
      shop: shop,
      shopApp: this.id,
      customer: customer,
      items: items,
      type: type,
      total: transactionTotal,
      newGP: newGP,
      newCurr
    };
    if (game.user.isGM) {
      OSRIS.socket.shopTransaction(transactionData);
    } else {
      game.socket.emit('module.osr-item-shop', { type: 'shopTransaction', data: transactionData });
    }
  }
  async _handleFastPack(fastPackType, actorId) {
    const actor = await game.actors.get(actorId);
    const actorClass = actor.system.details.class || null;
    const gpItem = await actor.items.getName(game.i18n.localize('OSRIS.curency.gp'));
    const gp = gpItem.system.quantity.value;
    let packList = this._fastPackList(fastPackType, actorClass);

    if (gp < packList.price) {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.insuffGold'));
      return;
    }
    await gpItem.update({ system: { quantity: { value: gp - packList.price } } });
    await this._addPackItems(actor, packList.items);
    return true;
  }
  _fastPackList(selection, actorClass = null) {
    let cItem;
    switch (actorClass) {
      case 'Cleric':
        cItem = game.i18n.localize('OSRIS.packs.holSymbolItem');
        break;
      case 'Thief':
        cItem = game.i18n.localize('OSRIS.packs.thiefToolItem');
        break;
      default:
        cItem = game.i18n.localize('OSRIS.packs.holWater');
    }
    const fastPack = {
      a: {
        price: 38,
        items: [
          { name: game.i18n.localize('OSRIS.packs.backpack'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.lgSackItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.lantern'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.flaskOilItem'), qty: 2 },
          { name: game.i18n.localize('OSRIS.packs.tinderbox'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.ironSpikesItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.smHammerItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.waterskin'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.rationStandard'), qty: 1 }
        ]
      },
      b: {
        price: 32,
        items: [
          { name: game.i18n.localize('OSRIS.packs.backpack'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.lgSackItem'), qty: 2 },
          { name: game.i18n.localize('OSRIS.packs.torchesItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.flaskOilItem'), qty: 3 },
          { name: game.i18n.localize('OSRIS.packs.tinderbox'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.poleItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.ropeItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.waterskin'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.rationStandard'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.mirrorItem'), qty: 1 }
        ]
      },

      c: {
        price: 42,
        items: [
          { name: game.i18n.localize('OSRIS.packs.backpack'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.smSackItem'), qty: 4 },
          { name: cItem, qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.ironSpikesItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.ropeItem'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.waterskin'), qty: 1 },
          { name: game.i18n.localize('OSRIS.packs.rationStandard'), qty: 1 }
        ]
      }
    };
    return fastPack[selection];
  }
  async _addPackItems(actor, itemList) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const universalPack = `osr-item-shop.osr-items-${game.i18n.lang}`; //await game.settings.get('osr-item-shop', 'universalShopCompendium');
    const compendium = await game.packs.get(universalPack);
    ui.notifications.warn(game.i18n.localize('OSRIS.notification.creatingItemsActor'));
    for (let item of itemList) {
      const itemData = await compendium.index.getName(item.name);
      const itemObj = await compendium.getDocument(itemData._id);
      const qty = item.qty;
      let count = 0;

      for (let i = 0; i < qty; i++) {
        count++;
        await sleep(10);
        await actor.createEmbeddedDocuments('Item', [itemObj]);
      }
    }
    ui.notifications.info(game.i18n.localize('OSRIS.notification.createItemsComplete'));
    return true;
  }
}
