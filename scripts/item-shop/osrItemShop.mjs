export class osrItemShop extends FormApplication {
  constructor(shop = 'universal', customer = null) {
    super();
    this.customer = customer;
    this.shop = shop;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      title: game.i18n.localize("OSRIS.itemShop.title"),
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
    context.shopName = "";
    if(context.universalShop){ 
      game.i18n.localize("OSRIS.shopSelect.universalShop")
    }else{
      if(game.i18n.lang === 'es'){
        context.shopName = `${game.i18n.localize("OSRIS.itemShop.pluralShopSuffix")}${this.shop.name}`
      }else{
        context.shopName = `${this.shop.name}${game.i18n.localize("OSRIS.itemShop.pluralShopSuffix")}`
      }
    }
    // `${this.shop.name}${game.i18n.localize("OSRIS.itemShop.pluralShopSuffix")}`;
    context.shopImg = context.universalShop ? 'modules/osr-item-shop/img/owlbear.webp' : this.shop.img;
    context.shopLabel = `Shopkeep:`;
    if (!context.universalShop) {
      const shopGpItem = this.shop.items.getName(game.i18n.localize("OSRIS.curency.gp"));
      context.shopGold = shopGpItem.system.quantity.value;
      context.shopKeep = this.shop.name;
    }
    context.custImg = this.customer.img;
    context.customerName = this.customer.name;
    context.customerGold = this.customer.items.getName(game.i18n.localize("OSRIS.curency.gp"))?.system?.quantity?.value;
    if(!context.customerGold){
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.noGpItemFound"));
      return;
    }
    return context;
  }

  async _getItems(actor = null) {
    let items = [];
    const itemObj = {};
    if (actor) {
      items = this._filterActorItems(actor);
    } else {
      const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
      let pack = await game.packs.get(packName);
      // if (!pack) pack = await game.packs.get(`world.${packName}`);
      if (!pack) {
        ui.notifications.warn(game.i18n.localize("OSRIS.notification.universalPackNotFound"));
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
  _sortAlpha(a, b){
    var nameA = a.name.toLowerCase();
    var nameB = b.name.toLowerCase();
    return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
  }
  _filterActorItems(actor) {
    const currency = [
      game.i18n.localize("OSRIS.curency.gp"),
      game.i18n.localize("OSRIS.curency.pp"),
      game.i18n.localize("OSRIS.curency.cp"),
      game.i18n.localize("OSRIS.curency.ep"),
      game.i18n.localize("OSRIS.curency.sp")
  ];
    const types = ['weapon', 'item', 'armor'];
    const items = actor.items.filter((i) => !currency.includes(i.name) && types.includes(i.type));
    return items;
  }
  _filterItems(items) {
    const currency = [
      game.i18n.localize("OSRIS.curency.gp"),
      game.i18n.localize("OSRIS.curency.pp"),
      game.i18n.localize("OSRIS.curency.cp"),
      game.i18n.localize("OSRIS.curency.ep"),
      game.i18n.localize("OSRIS.curency.sp")
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
    const buyTotal = html.find('#buy-total')[0];
    const sellTotal = html.find('#sell-total')[0];
    let itemEl = ev.target.closest('.item');
    let qtyEl = itemEl.querySelector('.item-qty');
    let cost = parseInt(itemEl.dataset.cost);
    let newTotal = parseInt(buyTotal.value) + cost;
    qtyEl.value = `${parseInt(qtyEl.value) + 1}`;
    if (type == 'buy') {
      buyTotal.value = newTotal;
    }
    if (type == 'sell') {
      sellTotal.value = newTotal;
    }
  }
  _subQty(ev, html, type) {
    ev.preventDefault();
    const buyTotal = html.find('#buy-total')[0];
    const sellTotal = html.find('#sell-total')[0];
    let itemEl = ev.target.closest('.item');
    let qtyEl = ev.target.closest('.item').querySelector('.item-qty');
    let qty = parseInt(qtyEl.value);
    let cost = parseInt(itemEl.dataset.cost);
    // if quantity is 1 or higher, deduct cost from total
    let newTotal = qty > 0 ? parseInt(buyTotal.value) - cost : parseInt(buyTotal.value);
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
      const total = parseInt(el.value) + parseInt(dataset.cost);
      el.value = total;
    }
    if (!checked) {
      const total = parseInt(el.value) - parseInt(dataset.cost);
      el.value = total;
    }
  }
  async _universalPurchase(html) {
    let packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
    let pack = await game.packs.get(packName);
    // if (!pack) pack = await game.packs.get(`world.${packName}`);
    if (!pack) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.universalPackNotFound"));
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
    let purchaseTotal = parseInt(html.find('#buy-total')[0].value);
    let gpItem = this.customer.items.getName(game.i18n.localize("OSRIS.curency.gp"));
    let gp = gpItem.system.quantity.value;

    if (itemList.length) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.creatingItemsActor"))
      for (let item of itemList) {
        let itemData = await pack.getDocument(item.itemId);

        for (let i = 0; i < item.qty; i++) {
          await this.customer.createEmbeddedDocuments('Item', [itemData]);
        }
      }
      await gpItem.update({ system: { quantity: { value: gp - purchaseTotal } } });
      ui.notifications.notify(game.i18n.localize("OSRIS.notification.createItemsComplete"));
      this.render();
    } else{
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.noItems"))
    }

    // OSRIS.socket.transactionComplete({id:game.user.id, appId: this.appId})
  }
  async _universalSale(html) {
    let transactionTotal = 0;
    let sellChecks = [...html.find('input.sell-check')].filter((i) => i.checked);
    let gpItem = this.customer.items.getName(game.i18n.localize("OSRIS.curency.gp"));
    let gp = gpItem.system.quantity.value;

    let items = sellChecks.map((i) => {
      let item = i.closest('.item').dataset;
      return {
        type: item.type,
        id: item.id,
        cost: parseInt(item.cost)
      };
    });
    items.map((i) => (transactionTotal += i.cost));
    for (let item of items) {
      let itemObj = await this.customer.items.get(item.id);
      await itemObj.delete();
    }
    await gpItem.update({ system: { quantity: { value: gp + transactionTotal } } });
    this.render();
  }
  async _shopTransaction(transactionType, html, shop, customer) {
    let customerGold = customer.items.getName(game.i18n.localize("OSRIS.curency.gp")).system.quantity.value;
    let shopGold = shop.items.getName(game.i18n.localize("OSRIS.curency.gp")).system.quantity.value;
    let transactionTotal = 0;
    let items;
    let type;
    let newGP;
    switch (transactionType) {
      case 'buy':
        type = 'buy';
        let buyChecks = [...html.find('input.buy-check')].filter((i) => i.checked);
        items = buyChecks.map((i) => {
          let item = i.closest('.item').dataset;
          return {
            type: item.type,
            id: item.id,
            cost: parseInt(item.cost)
          };
        });
        items.map((i) => (transactionTotal += i.cost));

        if (transactionTotal > customerGold) {
          ui.notifications.warn(game.i18n.localize("OSRIS.notification.insuffGold"));
          return;
        }
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
            cost: parseInt(item.cost)
          };
        });
        items.map((i) => (transactionTotal += i.cost));
        if (transactionTotal > shopGold) {
          ui.notifications.warn(game.i18n.localize("OSRIS.notification.insuffShopGold"));
          return;
        }
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
      newGP: newGP
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
    const gpItem = await actor.items.getName(game.i18n.localize("OSRIS.curency.gp"));
    const gp = gpItem.system.quantity.value;
    let packList = this._fastPackList(fastPackType, actorClass);

    if (gp < packList.price) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.insuffGold"));
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
        cItem = game.i18n.localize("OSRIS.packs.holSymbolItem");
        break;
      case 'Thief':
        cItem = game.i18n.localize("OSRIS.packs.thiefToolItem");
        break;
      default:
        cItem = game.i18n.localize("OSRIS.packs.holWater");
    }
    const fastPack = {
      a: {
        price: 38,
        items: [
          { name: game.i18n.localize("OSRIS.packs.backpack"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.lgSackItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.lantern"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.flaskOilItem"), qty: 2 },
          { name: game.i18n.localize("OSRIS.packs.tinderbox"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.ironSpikesItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.smHammerItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.waterskin"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.rationStandard"), qty: 1 }
        ]
      },
      b: {
        price: 32,
        items: [
          { name: game.i18n.localize("OSRIS.packs.backpack"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.lgSackItem"), qty: 2 },
          { name: game.i18n.localize("OSRIS.packs.torchesItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.flaskOilItem"), qty: 3 },
          { name: game.i18n.localize("OSRIS.packs.tinderbox"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.poleItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.ropeItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.waterskin"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.rationStandard"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.mirrorItem"), qty: 1 }
        ]
      },

      c: {
        price: 42,
        items: [
          { name: game.i18n.localize("OSRIS.packs.backpack"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.smSackItem"), qty: 4 },
          { name: cItem, qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.ironSpikesItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.ropeItem"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.waterskin"), qty: 1 },
          { name: game.i18n.localize("OSRIS.packs.rationStandard"), qty: 1 }
        ]
      }
    };
    return fastPack[selection];
  }
  async _addPackItems(actor, itemList) {
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const universalPack = await game.settings.get('osr-item-shop', 'universalShopCompendium');
    const compendium = await game.packs.get(universalPack);
    ui.notifications.warn(game.i18n.localize("OSRIS.notification.creatingItemsActor"));
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
    ui.notifications.info(game.i18n.localize("OSRIS.notification.createItemsComplete"));
    return true;
  }
}

export async function handleShopConfigTab(sheetObj, sheetEl, actorObj) {
  // if (!game.user.isGM && !game.settings.get('osr-item-shop', 'gmOnlyCharConfig')) {
    const actor = await game.actors.get(actorObj._id);
    // add config tab
    const templatePath = 'modules/osr-item-shop/templateData/config-tab/config-tab.hbs';
    const sheet = sheetEl[0];
    const sheetBody = sheet.querySelector('.sheet-body');
    const tabDiv = sheet.querySelector('.sheet-tabs.tabs');
    const tabs = tabDiv.querySelectorAll('.item');
    tabDiv.style.top = '340px';
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
    const tabContent = await renderTemplate(templatePath, templateData);
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
  // }

}

export async function newItemShop(data) {
  let { name, folder, gold, remainder, appendNumber, stock } = data;
  const defaultName = game.i18n.localize("OSRIS.itemShop.customShopPlur");
  const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
  let pack = game.packs.get(packName);
  let suff = appendNumber ? ` - ${Math.floor(Math.random() * 100 + 1)}` : ``;
  name = name ? `${name}${suff}` : `${game.i18n.localize("OSRIS.itemShop.customShop")}${suff}`;
  folder = folder ? game.folders.getName(folder) : game.folders.getName(defaultName);
  if (!folder) {
    folder = await Folder.create({
      name: defaultName,
      color: '#371150',
      type: 'Actor',
      parent: null
    });
  }
  const aData = {
    name: name,
    type: 'character',
    img: `modules/osr-item-shop/img/owlbear.webp`,
    permission: { default: 2 },
    folder: folder.id,
    token: { actorLink: true }
  };
  let actor = await Actor.create(aData);
  actor.setFlag('osr-item-shop', `shopConfig`, {
    enabled: true,
    shopName: aData.name
  });

  let gpId = pack.index.contents.find((a) => a.name == game.i18n.localize("OSRIS.curency.gp"))._id;
  const blankGp = await pack.getDocument(gpId);
  let gData = blankGp.clone();
  await actor.createEmbeddedDocuments('Item', [gData]);
  let goldItem = actor.items.getName(game.i18n.localize("OSRIS.curency.gp"));
  
  await goldItem.update({ system: { quantity: { value: gold } } });
  if (stock) {
    OSRIS.shop.stockItemShop(actor, remainder);
  }
}

export async function stockItemShop(actor, remainder) {
  const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
  remainder = remainder ? remainder : 50 + Math.floor(Math.random() * 10);
  const compendium = await game.packs.get(packName);
  const list = await compendium.getDocuments();
  let gpObj = actor.items.getName(game.i18n.localize("OSRIS.curency.gp"));
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
    failsafe += 1
    if(failsafe > 100)loop = false;
  }
  gpObj.update({ data: { quantity: { value: remainder } } });
}
export async function buyRandomItems(actorId = null, equipmentOnly = false) {
  let actor = actorId ? await game.actors.get(actorId) : null;
  if (!actor) {
    if (canvas.tokens.controlled.length != 1) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.selectOneToken"));
      return;
    }
    actor = canvas.tokens.controlled[0].actor;
  }
  if (!actor.isOwner || !game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("OSRIS.notification.noPermissiontoAlter"));
    return;
  }
  const gpItem = actor.items.getName(game.i18n.localize("OSRIS.curency.gp"));
  if (!gpItem) {
    ui.notifications.warn(`${game.i18n.localize("OSRIS.notification.noGpFoundActor")} ${actor.name}, ${game.i18n.localize("OSRIS.notification.abortPurchase")}`);
    return;
  }
  let gold = gpItem.system.quantity.value;
  const packName = game.settings.get('osr-item-shop', 'universalShopCompendium');
  let pack = await game.packs.get(packName);
  // if (!pack) pack = await game.packs.get(`world.${packName}`);
  if (!pack) {
    ui.notifications.warn(geme.i18n.localize("OSRIS.notification.universalPackNotFound"));
    return;
  }
  let itemList = pack.index.contents.filter((i) => i.name !== '#[CF_tempEntity]');
  const currency = [
    game.i18n.localize("OSRIS.curency.gp"), 
    game.i18n.localize("OSRIS.curency.pp"), 
    game.i18n.localize("OSRIS.curency.cp"), 
    game.i18n.localize("OSRIS.curency.ep"), 
    game.i18n.localize("OSRIS.curency.sp")
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
    console.log('items created');
    await gpItem.update({ system: { quantity: { value: gold - listObj.totalCost } } });
    ui.notifications.notify(`${game.i18n.localize("OSRIS.notification.itemsCreatedActor")} ${actor.name}.`);
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
      workObj.list.push(deepClone(curItem));
    }
  }
  return workObj;
}
export async function renderUniversalItemShop(actorId = null) {
  let actor = actorId ? await game.actors.get(actorId) : null;
  if (!actor) {
    if (canvas.tokens.controlled.length != 1) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.selectOneToken"));
      return;
    }
    actor = canvas.tokens.controlled[0].actor;
  }
  if (!actor.isOwner || (!actor.isOwner && !game.user.isGM)) {
    ui.notifications.warn(game.i18n.localize("OSRIS.notification.noPermissiontoAlter"));
    return;
  }
  new OSRIS.shopClass('universal', actor).render(true);
}
export async function renderItemShop(shopId = null, customerId = null) {
  let shop = shopId ? await game.actors.get(shopId) : null;
  let customer = customerId ? await game.actors.get(actorId) : null;
  if (!customer) {
    if (canvas.tokens.controlled.length != 1) {
      ui.notifications.warn(game.i18n.localize("OSRIS.notification.selectOneToken"));
      return;
    }
    customer = canvas.tokens.controlled[0].actor;
  }

  if (shop.getFlag('osr-item-shop', 'shopInUse')) {
    ui.notifications.warn(game.i18n.localize("OSRIS.notification.shopInUse"));
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
  new OSRIS.shopClass(shop, customer).render(true);
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
    console.log('shopOpen');
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
