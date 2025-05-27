export class osrItemShop extends FormApplication {
  constructor(shop = 'universal', customer = null) {
    super();
    this.customer = customer;
    this.shop = shop;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('OSRIS.itemShop.title'),
      classes: ['osris', 'osr-item-shop', 'item-shop'],
      width: 500,
      height: 600,
      tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.tab-content', initial: 'buy' }],
      template: `modules/osr-item-shop/templateData/item-shop/item-shop.hbs`
    });
  }
  async getData() {
    const context = super.getData();
    context.universalShop = this.shop == 'universal';
    context.shopItems = context.universalShop ? await this._getItems() : await this._getItems(this.shop);
    context.custItems = await this._getItems(this.customer);
    context.hidePacks = await game.settings.get('osr-item-shop', 'hidePacksTab');
    context.shopName = '';
    if (context.universalShop) {
      context.shopName = game.i18n.localize('OSRIS.shopSelect.universalShop');
    } else {
      const flagName = this.shop.flags?.['osr-item-shop']?.shopConfig?.shopName;
      context.shopName = flagName ? flagName : this.shop.name;
      // if (game.i18n.lang === 'es') {
      //   context.shopName = `${game.i18n.localize('OSRIS.itemShop.pluralShopSuffix')}${this.shop.name}`;
      // } else {
      //   context.shopName = `${this.shop.name}${game.i18n.localize('OSRIS.itemShop.pluralShopSuffix')}`;
      // }
    }
    // `${this.shop.name}${game.i18n.localize("OSRIS.itemShop.pluralShopSuffix")}`;
    context.shopImg = context.universalShop ? 'modules/osr-item-shop/img/owlbear.webp' : this.shop.img;
    context.shopLabel = `${game.i18n.localize('OSRIS.itemShop.shopKeep')}:`;
    if (!context.universalShop) {
      const shopGpItem = this.shop.items.getName(game.i18n.localize('OSRIS.curency.gp'));
      context.shopGold = shopGpItem.system.quantity.value;
      context.shopKeep = this.shop.name;
    }
    context.custImg = this.customer.img;
    context.customerName = this.customer.name;
    context.customerGold = await this.customer.items.getName(game.i18n.localize('OSRIS.curency.gp'))?.system?.quantity
      ?.value;
    // if (!context.customerGold) {
    //   ui.notifications.warn(game.i18n.localize('OSRIS.notification.noGpItemFound'));
    //   return;
    // }
    return context;
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
  async activateListeners(html) {
    const buyTotal = html.find('#buy-total')[0];
    const sellTotal = html.find('#sell-total')[0];
    const buyBtnPlus = html.find(`.buy.plus`);
    const buyBtnMinus = html.find(`.buy.minus`);
    const buyBtn = html.find('#buy-btn')[0];
    const sellBtn = html.find('#sell-btn')[0];
    const sellCheckList = html.find('.sell-check');
    const buyCheckList = html.find('.buy-check');
    const buyPackBtn = html.find('.buy-pack-btn')[0];
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
      const packEl = [...html.find('.pack-select')].filter((i) => i.checked);
      const packSelection = packEl[0].value;
      await this._handleFastPack(packSelection, this.customer._id);
      this.render();
    });
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
    const sellCheck = html.find('.sell-check');
    const buyCheck = html.find('.sell-check');
  }
  _addQty(ev, html, type) {
    ev.preventDefault();
    const buyEl = html.find('#buy-total')[0];
    const sellEl = html.find('#sell-total')[0];
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
    const buyTotal = html.find('#buy-total')[0];
    const sellTotal = html.find('#sell-total')[0];
    let itemEl = ev.target.closest('.item');
    let qtyEl = ev.target.closest('.item').querySelector('.item-qty');
    let qty = parseInt(qtyEl.value);
    let cost = parseFloat(itemEl.dataset.cost);
    // if quantity is 1 or higher, deduct cost from total
    let newTotal = qty > 0 ? parseFloat(buyTotal.value) - cost : parseFloat(buyTotal.value);
    let newQty = qty - 1 < 0 ? 0 : qty - 1;
    qtyEl.value = `${newQty}`;
    if (type == 'buy') {
      buyTotal.value = newTotal < 0 ? 0 : newTotal;
    }
    if (type == 'sell') {
      sellTotal.value = newTotal < 0 ? 0 : newTotal;
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
    let qtyEls = html.find('.item-qty');
    qtyEls.map((i) => {
      if (parseInt(qtyEls[i].value) >= 1)
        itemList.push({
          itemId: qtyEls[i].dataset.itemId,
          itemName: qtyEls[i].dataset.itemName,
          qty: parseInt(qtyEls[i].value)
        });
    });
    let purchaseTotal = parseFloat(html.find('#buy-total')[0].value);
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
    let sellChecks = [...html.find('input.sell-check')].filter((i) => i.checked);
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
        let buyChecks = [...html.find('input.buy-check')].filter((i) => i.checked);
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
        let sellChecks = [...html.find('input.sell-check')].filter((i) => i.checked);
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
      shopApp: this.appId,
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

export async function handleShopConfigTab(sheetObj, sheetEl, actorObj) {
  const actor = await game.actors.get(actorObj._id);
  // add config tab
  const templatePath = 'modules/osr-item-shop/templateData/config-tab/config-tab.hbs';
  const sheet = sheetEl[0];
  const sheetBody = sheet.querySelector('.sheet-body');
  const tabDiv = sheet.querySelector('.sheet-tabs.tabs');
  const tabs = tabDiv.querySelectorAll('.item');
  // hacky hyperborea implementation, rethiung for other systems
  if (game.system.id != 'hyperborea') tabDiv.style.top = '340px';
  // create tab
  let newTab = document.createElement('a');
  newTab.classList.add('item');
  newTab.dataset.tab = 'config';
  newTab.innerText = 'OSRIS';
  // add tab
  tabDiv.appendChild(newTab);
  // create tab content el
  const tabEl = document.createElement('div');
  tabEl.classList.add('tab', 'osris-config');

  tabEl.dataset.group = 'primary';
  tabEl.dataset.tab = 'config';
  // get/add tab content
  const flagData = actorObj.flags?.['osr-item-shop']?.shopConfig;
  const shopName = flagData?.shopName || `${actor.name}'s Items`;
  const actorShopEnabled = flagData?.enabled ? true : false;
  let templateData = {
    actor: actorObj,
    shopEnabled: actorShopEnabled,
    shopName: shopName
  };
  const tabContent = await foundry.applications.handlebars.renderTemplate(templatePath, templateData);
  tabEl.innerHTML = tabContent;
  sheetBody.appendChild(tabEl);
  const shopNameEl = sheetBody.querySelector('#shopName');
  const shopCheckEl = sheetBody.querySelector('#actorShopActive');
  const shopBtn = sheetBody.querySelector('.update-shop-config-btn');
  shopBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    actor.setFlag('osr-item-shop', 'shopConfig', {
      enabled: shopCheckEl.checked,
      shopName: shopNameEl.value
    });
  });
}

export async function newItemShop(data) {
  let { name, folderName, gold, remainder, appendNumber, stock, shopKeep } = data;
  const defaultName = game.i18n.localize('OSRIS.itemShop.customShopPlur');
  if (!folderName) folderName = defaultName;
  const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
  let pack = game.packs.get(packName);
  const items = await pack.getDocuments();
  let suff = appendNumber ? ` - ${Math.floor(Math.random() * 100 + 1)}` : ``;
  name = name ? `${name}${suff}` : `${game.i18n.localize('OSRIS.itemShop.customShop')}${suff}`;
  let folder = await game.folders.getName(folderName);
  if (!folder) {
    folder = await Folder.create({
      name: folderName,
      color: '#371150',
      type: 'Actor',
      parent: null
    });
  }
  const aData = {
    name: shopKeep,
    type: 'character',
    img: `modules/osr-item-shop/img/owlbear.webp`,
    permission: { default: 2 },
    folder: folder.id,
    prototypeToken: { actorLink: true },
    system: { details: { title: name } }
  };
  let actor = await Actor.create(aData);
  await actor.setFlag('osr-item-shop', `shopConfig`, {
    enabled: true,
    shopName: name
  });
  const gData = foundry.utils.deepClone(items.find((i) => i.name === game.i18n.localize('OSRIS.curency.gp')));
  const sData = foundry.utils.deepClone(items.find((i) => i.name === game.i18n.localize('OSRIS.curency.sp')));
  const cData = foundry.utils.deepClone(items.find((i) => i.name === game.i18n.localize('OSRIS.curency.cp')));
  const eData = foundry.utils.deepClone(items.find((i) => i.name === game.i18n.localize('OSRIS.curency.ep')));
  const pData = foundry.utils.deepClone(items.find((i) => i.name === game.i18n.localize('OSRIS.curency.pp')));
  await actor.createEmbeddedDocuments('Item', [gData, cData, sData, pData, eData]);
  let goldItem = actor.items.getName(game.i18n.localize('OSRIS.curency.gp'));

  await goldItem.update({ system: { quantity: { value: gold } } });
  if (stock) {
    OSRIS.shop.stockItemShop(actor, remainder);
  }
}

export async function stockItemShop(actor, remainder) {
  const curNames = [
    game.i18n.localize('OSRIS.curency.gp'),
    game.i18n.localize('OSRIS.curency.sp'),
    game.i18n.localize('OSRIS.curency.cp'),
    game.i18n.localize('OSRIS.curency.ep'),
    game.i18n.localize('OSRIS.curency.pp')
  ];
  const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
  remainder = remainder ? remainder : 50 + Math.floor(Math.random() * 10);
  const compendium = await game.packs.get(packName);
  const items = await compendium.getDocuments();
  const list = items.filter((i) => !curNames.includes(i.name));
  let gpObj = actor.items.getName(game.i18n.localize('OSRIS.curency.gp'));
  let initGP = gpObj.system.quantity.value;
  let gpTarget = initGP - remainder;
  let gpTotal = 0;
  let loop = true;
  let failsafe = 0;
  while (loop) {
    let curItem = list[Math.floor(Math.random() * list.length)];
    let qty = Math.floor(Math.random() * 5);
    if (gpTotal + curItem.system.cost * qty <= gpTarget) {
      gpTotal += curItem.system.cost * qty;
      const itemData = await compendium.index.getName(curItem.name);
      const itemObj = await compendium.getDocument(itemData._id);
      for (let i = 0; i < qty; i++) {
        await actor.createEmbeddedDocuments('Item', [itemObj]);
      }
      if (gpTotal >= gpTarget) loop = false;
    }
    failsafe += 1;
    if (failsafe > 100) loop = false;
  }
  gpObj.update({ data: { quantity: { value: remainder } } });
}
export async function buyRandomItems(actorId = null, equipmentOnly = false) {
  let actor = actorId ? await game.actors.get(actorId) : null;
  if (!actor) {
    if (canvas.tokens.controlled.length != 1) {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.selectOneToken'));
      return;
    }
    actor = canvas.tokens.controlled[0].actor;
  }
  if (!actor.isOwner || !game.user.isGM) {
    ui.notifications.warn(game.i18n.localize('OSRIS.notification.noPermissiontoAlter'));
    return;
  }
  const gpItem = await actor.items.getName(game.i18n.localize('OSRIS.curency.gp'));
  if (!gpItem) {
    ui.notifications.warn(
      `${game.i18n.localize('OSRIS.notification.noGpFoundActor')} ${actor.name}, ${game.i18n.localize(
        'OSRIS.notification.abortPurchase'
      )}`
    );
    return;
  }
  let gold = gpItem.system.quantity.value;
  const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
  let pack = await game.packs.get(packName);
  // if (!pack) pack = await game.packs.get(`world.${packName}`);
  if (!pack) {
    ui.notifications.warn(geme.i18n.localize('OSRIS.notification.universalPackNotFound'));
    return;
  }
  let itemList = pack.index.contents.filter((i) => i.name !== '#[CF_tempEntity]');
  const currency = [
    game.i18n.localize('OSRIS.curency.gp'),
    game.i18n.localize('OSRIS.curency.pp'),
    game.i18n.localize('OSRIS.curency.cp'),
    game.i18n.localize('OSRIS.curency.ep'),
    game.i18n.localize('OSRIS.curency.sp')
  ];
  const types = equipmentOnly ? ['item'] : ['weapon', 'item', 'armor'];
  itemList = itemList.filter((i) => !currency.includes(i.name) && types.includes(i.type));
  let items = [];
  for (let i of itemList) {
    let item = await pack.getDocument(i._id);
    items.push(item);
  }

  const listObj = OSRIS.shop.randomBuyList(gold, items, 3);

  if (listObj && listObj.list.length) {
    await actor.createEmbeddedDocuments('Item', listObj.list);

    await gpItem.update({ system: { quantity: { value: gold - listObj.totalCost } } });
    ui.notifications.notify(`${game.i18n.localize('OSRIS.notification.itemsCreatedActor')} ${actor.name}.`);
  }
}
export function randomBuyList(gold, itemArr, rem = 0) {
  rem = Math.floor(Math.random() * rem + 1);
  const workObj = {
    gold,
    list: [],
    initGold: gold,
    totalCost: 0
  };
  while (workObj.gold > rem) {
    let curItem = itemArr[Math.floor(Math.random() * itemArr.length)];
    let itemCost = curItem.system.cost;
    if (workObj.gold - itemCost >= rem) {
      workObj.gold -= itemCost;
      workObj.totalCost += itemCost;
      workObj.list.push(foundry.utils.deepClone(curItem));
    }
  }
  return workObj;
}
export async function renderUniversalItemShop(actorId = null) {
  let actor = actorId ? await game.actors.get(actorId) : null;
  if (!actor) {
    if (canvas.tokens.controlled.length != 1) {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.selectOneToken'));
      return;
    }
    actor = canvas.tokens.controlled[0].actor;
  }
  if (!actor.isOwner || (!actor.isOwner && !game.user.isGM)) {
    ui.notifications.warn(game.i18n.localize('OSRIS.notification.noPermissiontoAlter'));
    return;
  }
  // new OSRIS.shopClass('universal', actor).render(true);
  new OSRIS.shopClass({ shop: 'universal', customer: actor }).render(true);
}
export async function renderItemShop(shopId = null, customerId = null) {
  let shop = shopId ? await game.actors.get(shopId) : null;
  let customer = customerId ? await game.actors.get(actorId) : null;
  if (!customer) {
    if (canvas.tokens.controlled.length != 1) {
      ui.notifications.warn(game.i18n.localize('OSRIS.notification.selectOneToken'));
      return;
    }
    customer = canvas.tokens.controlled[0].actor;
  }

  if (shop.getFlag('osr-item-shop', 'shopInUse')) {
    ui.notifications.warn(game.i18n.localize('OSRIS.notification.shopInUse'));
    return;
  }
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

  // if(!shop.isOwner || !game.user.isGM){
  //   ui.notifications.warn('You Do Not Have Permission To Alter This Actor.')
  //   return
  // }
  // new OSRIS.shopClass(shop, customer).render(true);
  new OSRIS.shopClass({ shop, customer }).render(true);
}
export async function closeAllShops() {
  let openShops = game.actors.filter((a) => a.flags?.['osr-item-shop']?.shopInUse);
  let singleGM = game.users.filter((u) => u.role == 4 && u.active)[0];
  if (game.user.id == singleGM.id) {
    openShops.map((s) => {
      s.unsetFlag('osr-item-shop', 'shopInUse');
    });
  }
}
export async function openShopCheck() {
  let shopId = game.user.getFlag('osr-item-shop', 'shopOpen')?.shopId;
  if (shopId) {
    let socketData = {
      flag: 'shopInUse',
      flagData: null,
      actorId: shopId,
      type: 'unset'
    };
    game.socket.emit('module.osr-item-shop', { type: 'actorFlag', data: socketData });
    game.user.unsetFlag('osr-item-shop', 'shopOpen');
  }
}
export class osrItemShopConfig extends FormApplication {
  constructor(uuid, position) {
    super();
    this.uuid = uuid;
    this.repos = position;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: game.i18n.localize('OSRIS.itemShop.title'),
      classes: ['osris', 'item-shop-config'],
      width: 200,
      height: 230,
      template: `modules/osr-item-shop/templateData/item-shop/custom-shop-config.hbs`
    });
  }
  async getData() {
    const actor = await fromUuid(this.uuid);
    this.actor = actor || null;
    const flagData = actor?.flags?.['osr-item-shop']?.shopConfig;
    const context = super.getData();
    context.shopEnabled = flagData?.enabled;
    context.shopName = flagData?.shopName;
    this.position.left = this.repos.left;
    this.position.top = this.repos.top;
    return context;
  }
  activateListeners(html) {
    const shopActive = html.find('#actorShopActive')[0];
    const shopName = html.find('#shopName')[0];
    const updateBtn = html.find('.update-shop-config-btn')[0];
    shopName.addEventListener('blur', (e) => {
      e.preventDefault();
      if (shopName.value === '') {
        shopName.value = this.actor.name + ' shop';
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

    shopName.addEventListener('blur', (ev) => {
      ev.preventDefault();
      if (shopActive.checked && !shopName.value.length) {
        ui.notifications.warn(game.i18n.localize('OSRIS.notification.enterShopName'));
      }
    });
  }
}
