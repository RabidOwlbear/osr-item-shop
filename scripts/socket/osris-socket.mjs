export const socket = {
  registerSocket: function () {
    game.socket.on('module.osr-item-shop', OSRIS.socket.HandleSocket);
  },
  HandleSocket: async function (socketData, id) {
    const data = socketData.data;
    const type = socketData.type;
    let singleGM = game.users.filter((u) => u.isGM && u.active)[0];
    switch (type) {
      case 'setting':
        if (game.user.id != singleGM.id) return;
        if (data.type == 'set') {
          OSRIS.socket.setting(data.type, data);
        }
        if (data.type == 'get') {
          OSRIS.socket.setting(data.type, data);
        }
        break;
      case 'shopTransaction':
        if (game.user.id != singleGM.id) return;
        OSRIS.socket.shopTransaction(data);
        break;
      case 'actorFlag':
        if (game.user.id != singleGM.id) return;
        OSRIS.socket.GMActorFlag(data);
        break;
      case 'transactionComplete':
        OSRIS.socket.transactionComplete(data);
        break;
      case 'refreshOpenShop':
        OSRIS.socket.refreshOpenShop(data);
        break;
      case 'testSocket':
        console.log('---------------socket test emitted----------------', data);
    }
  },
  transactionComplete: async function (data) {
    ui.notifications.notify(game.i18n.localize('OSRIS.notification.transactionComplete'));
    if (game.user.isGM) {
      game.socket.emit('module.osr-item-shop', {
        type: 'refreshOpenShop',
        data: data
      });
      OSRIS.socket.refreshOpenShop(data);
    }
  },
  shopTransaction: async (data) => {
    const shop = await game.actors.get(data.shop._id);
    const customer = await game.actors.get(data.customer._id);
    let shopCurr = await getCurrencyItems(shop);
    let customerCurr = await getCurrencyItems(customer);
    let shopGP = shop.items.getName(game.i18n.localize('OSRIS.curency.gp'));
    let customerGP = customer.items.getName(game.i18n.localize('OSRIS.curency.gp'));
    let { items, total, newGP, newCurr } = data;
    let itemList = [];
    switch (data.type) {
      case 'buy':
        for (let item of items) {
          let itemObj = await shop.items.get(item.id);
          itemList.push(itemObj);
          // let shopItem = shop.items.get(item.id)
          await itemObj.delete();
        }
        await customer.createEmbeddedDocuments('Item', itemList);

        await updateCurr(customerCurr, newCurr.customer);
        await updateCurr(shopCurr, newCurr.shop);

        break;
      case 'sell':
        for (let item of items) {
          let itemObj = await customer.items.get(item.id);
          itemList.push(itemObj);
          await itemObj.delete();
        }
        await shop.createEmbeddedDocuments('Item', itemList);

        await updateCurr(customerCurr, newCurr.customer);
        await updateCurr(shopCurr, newCurr.shop);

        break;
    }
    if (game.user.isGM) {
      OSRIS.socket.transactionComplete({
        userId: data.userId,
        appId: data.shopApp
      });
    } else {
      game.socket.emit('module.osr-item-shop', {
        type: 'transactionComplete',
        data: {
          userId: data.userId,
          appId: data.shopApp
        }
      });
    }
  },
  refreshOpenShop: async (data) => {
    if (game.user.id == data.userId) {
      const app = foundry.applications.instances.get(data.appId);
      if (app) {
        app.render(true);
      }
    }
  },

  GMActorFlag: async (data) => {
    let { flag, flagData, actorId, type } = data;
    const actor = await game.actors.get(actorId);
    if (type == 'set') {
      actor.setFlag('osr-item-shop', flag, flagData);
    }
    if (type == 'unset') {
      actor.unsetFlag('osr-item-shop', flag);
    }
    return true;
  },
  settting: (data) => {
    let singleGM = game.users.filter((u) => u.isGM && u.active)[0];
    if (game.user.id != singleGM.id) return;
    switch (data.type) {
      case 'set':
        game.settings.set('osr-item-shop', data.setting, data.value);
        return true;
      case 'get':
        return game.settings.get('osr-item-shop', data.setting);
    }
  }
};

async function getCurrencyItems(actor) {
  const itemPack =
    game.system.id === 'ose'
      ? await game.packs.get(`osr-item-shop.osr-items-${game.i18n.lang}`)
      : await game.packs.get(`osr-item-shop.osr-items-${game.system.id}-${game.i18n.lang}`);
  const gpString = game.i18n.localize('OSRIS.curency.gp');
  const spString = game.i18n.localize('OSRIS.curency.sp');
  const cpString = game.i18n.localize('OSRIS.curency.cp');
  let gpItem = await actor.items.getName(gpString);
  let spItem = await actor.items.getName(spString);
  let cpItem = await actor.items.getName(cpString);
  const makeItem = async (str, act) => {
    const itemData = foundry.utils.deepClone(await itemPack.getDocument(itemPack.index.getName(str)._id));
    await act.createEmbeddedDocuments('Item', [itemData]);
    return await act.items.getName(str);
  };
  if (!spItem) {
    spItem = await makeItem(spString, this.customer);
  }
  if (!cpItem) {
    cpItem = await makeItem(cpString, this.customer);
  }
  return {
    gp: gpItem,
    sp: spItem,
    cp: cpItem
  };
}
async function updateCurr(curObj, amt) {
  for (let key of Object.keys(curObj)) {
    await curObj[key].update({ 'system.quantity.value': amt[key] });
  }
}
