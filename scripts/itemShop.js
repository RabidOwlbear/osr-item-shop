/*  
[
    {
      header: 'header string',
      data:  dataObj, //object array contaning item data
      options: [
        {
        name: 'source name', // text used for radio selector
        source: 'sourceName', //string used in data object.source
        }
      ]
    }
]


1. get options list from game settings
2. get itemList from game settings
3. find source list div
4. loop through options, 
  a. add source div using options[i].name, with value of options[i].source to retHTML
5. add retHTML to source list div
6. run item-list function with returned selected source

*/

Hooks.on('init', async () => {
  await game.settings.register('osrItemShop', 'sourceList', {
    name: 'sourceList',
    type: Array,
    default: [],
    scope: 'world'
  });
  await game.settings.register('osrItemShop', 'itemList', {
    name: 'itemList',
    type: Array,
    default: [],
    scope: 'world'
  });

  console.log(`
  --------------------------
  itemShop Loaded
  --------------------------
  `);
});
Hooks.once('ready', async () => {
  console.log('osrItemSHop ready');
  let ose = game.modules.get('old-school-essentials')?.active;
  console.log('ding', ose);
  //if old school essential module installed
  if (ose) {
    const optionsObj = [
      {
        header: 'Old School Essentials',
        data: OSE.itemData,
        options: [
          {
            name: 'Items',
            source: 'OSE',
            itemTypes: [`weapons`, `armor`, `equipment`, `ammunition`]
          }
        ]
      }
    ];
    if (game.user.role >= 4) {
      
      await game.settings.set('osrItemShop', 'sourceList', optionsObj);
      await game.settings.set('osrItemShop', 'itemList', OSE.itemData);
    }
  } else {
    const optionsObj = [
      {
        header: 'OSE SRD',
        data: OSRIS.itemData,
        options: [
          {
            name: 'SRD Items',
            source: 'oseSrd',
            itemTypes: [`weapons`, `armor`, `equipment`, `ammunition`]
          }
        ]
      }
    ];
    if (game.user.role >= 4) {
      
      await game.settings.set('osrItemShop', 'sourceList', optionsObj);
      await game.settings.set('osrItemShop', 'itemList', OSRIS.itemData);
    }
  }

  Hooks.call('osrItemShopActive');
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  sleep(5000);
  let curData = game.settings.get('osrItemShop', 'sourceList');
  //console.log('options obj', curData);
});

Hooks.on('renderItemShopForm', async (formObj, html, c) => {
  //console.log('FormObj', formObj, 'html', html, 'c', c);
  let sourceList = await game.settings.get('osrItemShop', 'sourceList');
  const itemCont = html.find(`[id="item-list"]`)[0];
  const sourceCont = html.find(`[id="source-list"]`)[0];
  const actorGold = html.find(`span[id="actor-gold"]`)[0];
  const sList = await OSRIS.shop.listContent({ type: 'source', data: sourceList, isItem: false }, html);
  const actorGp = formObj.actor.data.items.getName('GP').data.data.quantity.value;
  //console.log(actorGp);
  actorGold.innerText = `${actorGp}`;

  //console.log(sList, sourceCont);
  sourceCont.innerHTML = sList.content;
  //console.log('sItems');
  const sItems = await OSRIS.shop.listContent({
    type: 'items',
    data: sourceList,
    selected: sList.selected,
    isItem: false
  });
  let sInputs = html.find(`[id="source-list"] input`);
  for (let input of sInputs) {
    input.addEventListener('input', async () => {
      console.log(input.value);
      let listContent = await OSRIS.shop.listContent({
        type: 'items',
        data: sourceList,
        selected: input.value,
        isItem: false
      });
      itemCont.innerHTML = listContent;
      let plus = html.find(`[id="button-plus"]`);
      let minus = html.find(`[id="button-minus"]`);
      //console.log(plus);
      for (let button of plus) {
        button.addEventListener('click', () => {
          //console.log('poop', button);
          OSRIS.shop.shopAddItem(html, button.value, 'plus');
        });
      }
      for (let button of minus) {
        button.addEventListener('click', () => {
          OSRIS.shop.shopAddItem(html, button.value, 'minus');
        });
      }
    });
  }
  //console.log(sInputs);

  // console.log(sItems);
  itemCont.innerHTML = sItems;

  let plus = html.find(`[id="button-plus"]`);
  let minus = html.find(`[id="button-minus"]`);
  // console.log(plus);
  for (let button of plus) {
    button.addEventListener('click', () => {
      //console.log('poop', button);
      OSRIS.shop.shopAddItem(html, button.value, 'plus');
    });
  }
  for (let button of minus) {
    button.addEventListener('click', () => {
      OSRIS.shop.shopAddItem(html, button.value, 'minus');
    });
  }

  // console.log('sList', sList);
  // const sOptions = await OSRIS.shop.listContent({ type: 'options', data: sourceList, isItem: false });
  // const sItems = await OSRIS.shop.listContent({
  //   type: 'items',
  //   data: sourceList,
  //   selected: sList.selected,
  //   isItem: false
  // });
});

Hooks.on('OSRIS Registered', ()=>{
  OSRIS.shop = OSRIS.shop || {}

  OSRIS.shop.ItemShopForm = class ItemShopForm extends FormApplication {
  constructor(object, options, actor) {
    super(object, options);
    this.actor = actor;
    // this.actorId = actor.id;
    // this.actorName = actor.name;
    // this.shop = shop;
  }
  static get defaultOptions() {
    return super.defaultOptions;
  }
  getData(options = {}) {
    return super.getData().object; // the object from the constructor is where we are storing the data
  }
  activateListeners(html) {
    super.activateListeners(html);
    const closeBtn = html.find('#close');
    const buyBtn = html.find('#buy-btn');
    //console.log(buyBtn);
    buyBtn.on('click', (event) => {
      const ag = parseInt(html.find('#actor-gold')[0].innerText);
      const tp = parseInt(html.find('#total-price')[0].innerText);
      //console.log(ag, tp);
      if (ag - tp < 0) {
        //console.log('button blocked', event);
        ui.notifications.warn('Not Enough Gold!');
        event.preventDefault();
        return;
      }
      // console.log('enough gold', event);
    });
    closeBtn.on('click', () => {
      //console.log('close', this);
      this.close();
    });
    const plusBtns = document.querySelectorAll('#button-plus');
    for (let button of plusBtns) {
      //console.log(button.value);
      button.addEventListener('click', (event) => {
        event.preventDefault();
        //console.log(event, a, b, c);
      });
    }
    //console.log('1111', plusBtns);
  }
  async _updateObject(event, formData) {
    //console.log('<------ default behavior');
    let total = parseInt(document.getElementById('total-price').innerText);
    event.preventDefault();
    delete formData.source;
    let itemObj = {
      actor: this.actor,
      totalCost: total,
      list: formData
    };

    OSRIS.shop.buyItems(itemObj);

  }
}

OSRIS.shop.renderItemShop = async function (actor = null) {
  const shopFormOptions = {
    classes: ['form', 'osrShopForm'],
    popOut: true,
    template: `modules/osr-item-shop/templateData/item-shop.html`,
    id: 'itemShopForm',
    title: 'Item Shop',
    width: 900,
    height: 800
  };

  if (actor == null) {
    let token = canvas.tokens.controlled;
    if (token.length < 1 || token.length > 1) {
      ui.notifications.warn('Please select one token');
      return;
    }
    actor = token[0].actor;
  }

  const goldItem = actor.data.items.find((i) => i.name == 'GP');
  if (!goldItem) {
    ui.notifications.error('No Gold Found');
    return;
  }

  let shop = new OSRIS.shop.ItemShopForm({}, shopFormOptions, actor);
  shop.render(true);
}

OSRIS.shop.listContent = async function (data, html) {
  const sourceList = game.settings.get('osrItemShop', 'sourceList');
  const listData = game.settings.get('osrItemShop', 'itemList');
  // console.log(listData)
  //console.log('sourceList', sourceList);
  let retHtml = ``;
  let selected = undefined;
  if (data.type == 'source') {
    let checked;
    //return compiled source list html
    for (let source of sourceList) {
      //console.log('source', source);
      //add checked property to first item on list
      if (!selected) {
        checked = `checked`;
        selected = source.options[0].source;
      } else {
        checked = ``;
      }
      //add header
      retHtml += `<div class="pl5 pb5"><b>${source.header}</b></div>`;
      //add source options
      for (let option of source.options) {
        retHtml += `
        <div class="fx-sb cb-list ph10">
          <label for="${option.name}">${option.name}</label>
          <input type="radio" name="source" id="${option.name}" value="${option.source}" ${checked}/>
        </div>`;
      }
    }
    // console.log('retHtml', retHtml);
    return { content: retHtml, selected };
  }

  if (data.type == 'items') {
    let retHtml = ``;
    let list = null;
    let headerList = OSRIS.shop.getHeaders(sourceList, data.selected);
    console.log(headerList);
    list = listData.filter((i) => i.source == data.selected);
    // for (let source of sourceList) {
    //   // console.log('sourceList source', source, data);
    //   // list = source.options.find((o) => o.name == data.selected)?.data;

    //   // console.log('list', list);
    // }
    //console.log(list);
    //check that list has a value
    if (list) {
      let listHtml = ``;
      // loop through list creating an array of item types for headers

      //console.log('headers', headers);
      for (type of headerList) {
        sectionHtml = `<div><b>${type}</b></div>`;
        const items = list.filter((i) => i.type == type);
        //console.log('items', items);
        for (let item of items) {
          //console.log(item);
          sectionHtml += `<div class="shop-item">
          <div class="item-name">${item.name}</div>
          <div class="item-price">${item.cost}GP</div>  
            <div class="qty-btn-div">
              <button type="button" class="shop-item-btn" id="button-minus" value="${item.id}"><i class="fas fa-minus-square"></i></button>
              <button type="button" class="shop-item-btn" id="button-plus" value="${item.id}"><i class="fas fa-plus-square"></i></button>
            </div>
          
          </div>`;
        }
        listHtml += sectionHtml;
      }
      retHtml = `<div id="item-list-div" class="item-cont"> ${listHtml} </div>`;
    }
    //console.log(retHtml);
    return retHtml;
  }
}

OSRIS.shop.getHeaders = function (list, source) {
  console.log(list, source);
  for (let src of list) {
    console.log(source, src);
    let hList = src.options.find((s) => s.source == source);
    console.log(hList);
    if (hList) {
      console.log(hList.itemTypes);
      return hList.itemTypes;
    }
  }
}



// utlity functions

OSRIS.shop.shopAddItem = function (html, id, state) {
  //console.log(id);
  const cartCont = html.find(`[id="cart-div"]`);
  const tPrice = html.find(`span[id="total-price"]`)[0];
  let inp = cartCont.find(`[name='${id}']`)[0];
  //console.log(tPrice);
  // console.log(itemList, itemObj);
  //console.log(cartCont);
  if (state == 'plus') {
    //console.log(cartCont);
    const itemList = game.settings.get('osrItemShop', 'itemList');
    const itemObj = itemList.find((i) => i.id == id);

    if (inp) {
      let newValue = parseInt(inp.value) + 1;
      inp.value = `${newValue}`;
      let itemPrice = html.find(`[id="${id}"][class="item-price cart-price"]`);
      //console.log(itemPrice, itemObj);
      let itemDiv = html.find(`[id="${id}"]`);
      let price = itemDiv.find(`[class="item-price cart-price"]`)[0];
      price.innerText = `${parseInt(price.innerText) + itemObj.cost}GP`;
    } else {
      let el = document.createElement('div');
      el.id = itemObj.id;
      el.className = 'shop-item';
      el.innerHTML = `<div class="item-name"> ${itemObj.name}</div>
      <div class="item-price cart-price">${itemObj.cost}GP</div>  
      <input type="number" class="item-qty shop-qty cart-item" name="${itemObj.id}" value="1" />  `;

      cartCont[0].appendChild(el);
      inp = cartCont.find(`[name='${id}']`)[0];
      inp.addEventListener('blur', (ev) => {
        setTimeout(() => {
          let price = html.find(`[id="${id}"] [class="item-price cart-price"]`)[0];
          //console.log('inp value', inp.value);
          if (parseInt(inp.value) <= 0 || inp.value == '') {
            let item = html.find(`[id="${id}"]`)[0];
            //console.log(item);
            //console.log('blur', id);
            tPrice.innerText = `${parseInt(tPrice.innerText) - parseInt(price.innerText)}`;
            item.remove();
          } else {
            //console.log('not 0', id);

            //console.log(price);
            let oldPrice = parseInt(price.innerText);
            let newPrice = itemObj.cost * parseInt(inp.value);
            price.innerText = `${newPrice}GP`;
            if (newPrice > oldPrice) {
              tPrice.innerText = `${parseInt(tPrice.innerText) + (newPrice - oldPrice)}`;
            } else {
              tPrice.innerText = `${parseInt(tPrice.innerText) - (oldPrice - newPrice)}`;
            }
          }
        }, 300);
      });
    }
    tPrice.innerText = `${parseInt(tPrice.innerText) + itemObj.cost}`;
  }
  if (state == 'minus') {
    // const cartCont = html.find(`[id="cart-div"]`);
    const itemList = game.settings.get('osrItemShop', 'itemList');
    const itemObj = itemList.find((i) => i.id == id);
    const itemPrice = html.find(`[id="${id}"][class="item-price cart-price"]`);
    let itemDiv = html.find(`[id="${id}"]`);
    let price = itemDiv.find(`[class="item-price cart-price"]`)[0];
    if (inp) {
      tPrice.innerText = `${parseInt(tPrice.innerText) - itemObj.cost}`;
      price.innerText = `${parseInt(price.innerText) - itemObj.cost}GP`;
      inp.value = parseInt(inp.value) - 1;
      if (inp.value <= 0) {
        let item = html.find(`[id="${id}"]`)[0];
        item.remove();
      }
    }
  }
  // console.log(cartCont);
}

/* 
data: {
  actor: actor accessing app;
  list: array of item objects: {name: string item name, qty: number how many to add, 
  totalCost: num total cost of transaction}
}
*/
OSRIS.shop.buyItems = async function (data) {
  const itemList = game.settings.get('osrItemShop', 'itemList');
  const { list, actor } = data;
  const goldItem = actor.data.items.getName('GP');
  //console.log(goldItem);
  const actorGold = goldItem.data.data.quantity.value;
  //console.log(actorGold);
  const newGp = actorGold - data.totalCost;
  //console.log(newGp, data.totalCost);
  await goldItem.update({ data: { quantity: { value: newGp } } });
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  //console.log(compendium);
  ui.notifications.info('Adding Items To Sheet');
  for (let id in list) {
    let itemInfo = itemList.find((i) => i.id == id);

    const compendium = await game.packs.get(itemInfo.pack);
    let item = {
      name: itemInfo.name,
      qty: list[id],
      stack: itemInfo.stack
    };
    //console.log(item);
    await sleep(500);
    const itemData = await compendium.index.getName(item.name);
    const itemObj = await compendium.getDocument(itemData._id);
    let existingItem = await actor.data.items.getName(itemObj.name);
    // console.log('existing', existingItem);
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
      //console.log(itemData, oldQty, newQty);
      await actor.createEmbeddedDocuments('Item', [itemData.data]);
      let existingItem = actor.data.items.getName(itemObj.name);
      let data = { data: { quantity: { value: newQty } } };
      //console.log('data', data);
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

})