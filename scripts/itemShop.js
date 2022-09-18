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


export const registerItemShop = ()=>{
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
    
    buyBtn.on('click', (event) => {
      const ag = parseInt(html.find('#actor-gold')[0].innerText);
      const tp = parseInt(html.find('#total-price')[0].innerText);
      
      if (ag - tp < 0) {
        
        ui.notifications.warn('Not Enough Gold!');
        event.preventDefault();
        return;
      }
      
    });
    closeBtn.on('click', () => {
      
      this.close();
    });
    const plusBtns = document.querySelectorAll('#button-plus');
    for (let button of plusBtns) {
      
      button.addEventListener('click', (event) => {
        event.preventDefault();
        
      });
    }
    
  }
  async _updateObject(event, formData) {
    
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

  const goldItem = actor.items.find((i) => i.name == 'GP');
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
  
  
  let retHtml = ``;
  let selected = undefined;
  if (data.type == 'source') {
    let checked;
    //return compiled source list html
    for (let source of sourceList) {
      
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
    
    return { content: retHtml, selected };
  }

  if (data.type == 'items') {
    let retHtml = ``;
    let list = null;
    let headerList = await OSRIS.shop.getHeaders(sourceList, data.selected);
    
    list = listData.filter((i) => i.source == data.selected);
    //check that list has a value
    if (list) {
      let listHtml = ``;
      // loop through list creating an array of item types for headers

      
      
      for (let type of headerList) {
        let sectionHtml = `<div><b>${type}</b></div>`;
        const items = list.filter((i) => i.type == type);
        
        for (let item of items) {
          
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
    
    return retHtml;
  }
}

OSRIS.shop.getHeaders = function (list, source) {
  
  for (let src of list) {
    
    let hList = src.options.find((s) => s.source == source);
    
    if (hList) {
      
      return hList.itemTypes;
    }
  }
}



// utlity functions

OSRIS.shop.shopAddItem = function (html, id, state) {
  
  const cartCont = html.find(`[id="cart-div"]`);
  const tPrice = html.find(`span[id="total-price"]`)[0];
  let inp = cartCont.find(`[name='${id}']`)[0];
  
  
  
  if (state == 'plus') {
    
    const itemList = game.settings.get('osrItemShop', 'itemList');
    const itemObj = itemList.find((i) => i.id == id);

    if (inp) {
      let newValue = parseInt(inp.value) + 1;
      inp.value = `${newValue}`;
      let itemPrice = html.find(`[id="${id}"][class="item-price cart-price"]`);
      
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
          
          if (parseInt(inp.value) <= 0 || inp.value == '') {
            let item = html.find(`[id="${id}"]`)[0];
            
            
            tPrice.innerText = `${parseInt(tPrice.innerText) - parseInt(price.innerText)}`;
            item.remove();
          } else {
            

            
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
  const goldItem = actor.items.getName('GP');
  
  const actorGold = goldItem.system.quantity.value;
  
  const newGp = actorGold - data.totalCost;
  
  await goldItem.update({ data: { quantity: { value: newGp } } });
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

  
  ui.notifications.info('Adding Items To Sheet');
  for (let id in list) {
    let itemInfo = itemList.find((i) => i.id == id);

    const compendium = await game.packs.get(itemInfo.pack);
    let item = {
      name: itemInfo.name,
      qty: list[id],
      stack:  false //itemInfo.stack
    };
    
    await sleep(500);
    const itemData = await compendium.index.getName(item.name);
    const itemObj = await compendium.getDocument(itemData._id);
    let existingItem = await actor.items.getName(itemObj.name);
    
    if (existingItem && item.stack == true) {
      console.log('stack existing, sheet existing');
      let newQty = existingItem.system.quantity.value + itemObj.system.quantity.value * item.qty;
      let data = { data: { quantity: { value: newQty } } };

      
      await existingItem.update(data);
    } else if (!existingItem && item.stack) {
      console.log('stack existing');
      const itemData = await itemObj.clone();
      const oldQty = itemData.system.quantity.value;
      const newQty = oldQty * item.qty;
      itemData.system.quantity.value = newQty;
      
      await actor.createEmbeddedDocuments('Item', [itemData]);
      let existingItem = actor.items.getName(itemObj.name);
      let data = { data: { quantity: { value: newQty } } };
      
      await existingItem.update(data);
    } else {
      for (let i = 0; i < item.qty; i++) {
        const data = itemObj.clone();
        await actor.createEmbeddedDocuments('Item', [data]);
      }
    }
  }
  ui.notifications.info('Completed Adding Items To Sheet');
}

}