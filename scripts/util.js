function registerUtilities(){
// Hooks.on('OSRIS Registered', ()=>{
OSRIS.util.addPackItems = async function (actor, itemList) {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const compendium = await game.packs.get('osr-item-shop.osr items');
  ui.notifications.warn('Adding Items To Character Sheet, Please Be Patient.')
  for (let item of itemList) {

    const itemData = await compendium.index.getName(item.name);
    const itemObj = await compendium.getDocument(itemData._id);
    const qty = item.qty;
    console.log('item', itemObj.data);
    let count = 0;
    
    for (let i = 0; i < item.qty; i++) {
      count++;
      console.log('item count', count, item.name);
      await sleep(10);
      await actor.createEmbeddedDocuments('Item', [itemObj.data]);
    }
    
  }
  ui.notifications.info('Finished Adding items')
}

/* 
data: {
  actor: actor accessing app;
  list: array of item objects: {name: string item name, qty: number how many to add, 
  totalCost: num total cost of transaction}
}
*/
OSRIS.util.buyItems = async function (data) {
  const { list, actor } = data;
  const goldItem = actor.data.items.getName('GP');
  //console.log(goldItem);
  const actorGold = goldItem.data.data.quantity.value;
  //console.log(actorGold);
  const newGp = actorGold - data.totalCost;
  //console.log(newGp, data.totalCost);
  await goldItem.update({ data: { quantity: { value: newGp } } });
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  const compendium = await game.packs.get('osr-item-shop.osr items');
  //console.log(compendium);
  ui.notifications.info('Adding Items To Sheet');
  for (let item of list) {
    await sleep(10);
    console.log('item', item);
    const itemData = await compendium.index.getName(item.name);
    const itemObj = await compendium.getDocument(itemData._id);
    // console.log('itemObj', itemObj);
    let existingItem = actor.data.items.getName(itemObj.name);
    //console.log('existing', existingItem);
    if (existingItem && item.stack == true) {
      console.log('stack existing, sheet existing');
      let newQty = existingItem.data.data.quantity.value + itemObj.data.data.quantity.value * item.qty;
      let data = { data: { quantity: { value: newQty } } };

      //console.log('data', data);
      await existingItem.update(data);
    } else if (!existingItem && item.stack) {
      console.log('stack existing');
      const itemData = await itemObj.clone();
      const oldQty = itemData.data.data.quantity.value;

      const newQty = oldQty * item.qty;

      itemData.data.data.quantity.value = newQty;
      console.log(itemData, oldQty, newQty);
      await actor.createEmbeddedDocuments('Item', [itemData.data]);
      let existingItem = actor.data.items.getName(itemObj.name);

      let data = { data: { quantity: { value: newQty } } };
      console.log('data', data);
      await existingItem.update(data);
    } else {
      for (let i = 0; i < item.qty; i++) {
        const data = itemObj.clone().data;
        await actor.createEmbeddedDocuments('Item', [data]);
      }
    }
  }
  ui.notifications.info('Completed Adding Items To Sheet');
}
OSRIS.util.checkGold = function (actor, price) {
  const gold = actor.data.items.getName('GP')?.data.data.quantity.value;
  if (price) {
    if (gold < price) {
      ui.notifications.warn('Not Enough Gold!');
      return 0;
    }
    return gold - price;
  }
  return gold;
}

OSRIS.util.buyList = async function (formData) {
  console.log(formData);
  const retObj = { totalCost: 0, list: [] };
  for (let item of Object.keys(formData)) {
    //console.log(item);
    if (formData[item] > 0) {
      console.log('buy me', item.name);
      const itemData = OSRIS.itemData.find((i) => i.name == item);
      itemData.qty = formData[item];
      retObj.list.push(itemData);
      retObj.totalCost += itemData.cost * formData[item];
    }
  }
  console.log('retObj', retObj);
  return retObj;
}

OSRIS.util.totalDisplay = function (html) {
  let total = 0;
  console.log('element', html);
  const inputs = html.find('.shop-qty');
  //console.log(inputs);
  for (let input of inputs) {
    total += OSRIS.itemData.find((i) => i.name == input.name)?.cost * input.value;
  }
  console.log('total', total);
  //const actorGold = html.find('#actor-gold')[0];
  const totalPrice = html.find('#total-price')[0];
  totalPrice.innerText = total;
  //console.log('html actor gold', actorGold);
  //actorGold.innerText = `100`;
  return total;
}
OSRIS.util.addHtml = async function (list, html) {
  console.log('list', list, html);
  for (let item of list) {
    // const elementId = `#${item}`;
    const element = await html.find(`#${item}`)[0];
    const content = await document.createElement('div');
    //console.log('stuff', item, elementId, element, content);
    //content.setAttribute('id', item);
    content.classList.add('category-div');
    const txtContent = item.charAt(0).toUpperCase() + item.slice(1);
    const categoryHeader = `<h2>${txtContent}:</h2>` + (await osrShopItemHtml(osrShopLists[item]));
    content.innerHTML += categoryHeader;
    element.appendChild(content);
  }

  const actorInfoContent = await document.createElement('div');
  actorInfoContent.classList.add('category-div');

  return html;
}

OSRIS.util.osrItemsByType = function (type) {
  const items = OSRIS.itemData.filter((i) => i.type == type);
  console.log(items);
  return items;
}

OSRIS.util.randomBuyList = function (actor, gold, itemArr, rem = 0) {
  const itemList = actor.item;
  rem = Math.floor(Math.random() * rem + 1);
  console.log('rem', rem, itemArr);
  const workObj = {
    gold,
    list: [],
    initGold: gold,
    totalCost: 0
  };
  while (workObj.gold > rem) {
    let curItem = itemArr[Math.floor(Math.random() * itemArr.length)];
    const actorOwned = actor.items.getName(curItem.name);
    let actorOwnedQty =
      typeof actorOwned?.data?.data?.quantity?.value == 'number' ? actorOwned.data.data.quantity.value : 0;
    let inList = workObj.list.find((obj) => obj.name == curItem.name);
    console.log('ownedInit', inList, actorOwnedQty);
    //console.log('item', curItem, 'owned', owned);

    if (workObj.gold - curItem.cost >= rem) {
      console.log(curItem.name, curItem.cost, workObj.gold);

      if (!inList && !actorOwned) {
        console.log('not in list, not owned');
        workObj.list.push({ name: curItem.name, qty: 1, maxAllowed: curItem.maxAllowed, stack: curItem.stack });
        workObj.gold -= curItem.cost;
        workObj.totalCost += curItem.cost;
      } else if (inList && inList.qty + actorOwnedQty < curItem.maxAllowed) {
        console.log('in list, list + actor qty less than max', typeof actorOwned);
        inList.qty++;
        workObj.gold -= curItem.cost;
        workObj.totalCost += curItem.cost;
      } else if (!inList && actorOwned) {
        console.log('not in list, on actor');
        if (actorOwnedQty < curItem.maxAllowed) {
          workObj.list.push({ name: curItem.name, qty: 1, maxAllowed: curItem.maxAllowed, stack: curItem.stack });
          workObj.gold -= curItem.cost;
          workObj.totalCost += curItem.cost;
        }
      }
    }
  }
  return workObj;
}

OSRIS.util.buyRandomItems = async function (type = 'equipment') {
  if(canvas.tokens.controlled.length == 0 || canvas.tokens.controlled.length > 1 ){
    console.log('woot')
    ui.notifications.warn('Please select one token')
    return;
}
  const actor = canvas.tokens.controlled[0].actor;


  const itemList = OSRIS.util.osrItemsByType(type);
  const gold = await actor.data.items.getName('GP').data.data.quantity.value;
  const actorItems = actor.data.items.contents;
  const listObj = await OSRIS.util.randomBuyList(actor, gold, itemList, 3);
  console.log(listObj);
  OSRIS.util.buyItems({ list: listObj.list, actor: actor, totalCost: listObj.totalCost });
}

OSRIS.util.clearText = function (field) {
  console.log('event', field);
  if (field.defaultValue == field.value) {
    field.value = ``;
  } else if (field.value == ``) {
    field.value = field.defaultValue;
  }
}

}
// })
export {registerUtilities}