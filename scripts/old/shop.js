

Hooks.on('renderfastPack', (app, html) => {
  const div = html.find('#pack-div');
  console.log('here da div', div[0].innerHTML);
});
Hooks.on('renderosrItemShopForm', async (app, html) => {
  const goldItem = app.actor.data.items.find((i) => i.name == 'GP');
  const actorGold = goldItem.data.data.quantity.value;

  const actorGoldDisplay = html.find('#actor-gold')[0];
  console.log('actor gold', actorGoldDisplay);
  actorGoldDisplay.innerText = actorGold;
  const idList = ['weapons', 'armor', 'items', 'ammunition'];

  const updatedHtml = await addHtml(idList, html);
  const qtyInputs = updatedHtml.find(`.shop-qty`);
  //console.log('qty inputs', qtyInputs, updatedHtml);
  for (let input of qtyInputs) {
    //console.log(input);
    input.addEventListener('focus', () => {
      clearText(input);
    });
    input.addEventListener('blur', () => {
      clearText(input);
    });
    input.addEventListener('input', (a, b, c) => {
      // const shop = document.getElementById('item-shop-container');
      // console.log('html<=======', a, shop);

      totalDisplay(html);
    });
  }
});
//  const shopData = {};

class osrItemShop extends Application {
  constructor(actor) {
    super();
    this.actor = actor;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['application', 'osrItemShop'],
      popOut: true,
      template: `modules/osr-item-shop/templateData/item-shop-template.html`,
      id: 'osrItemShop',
      title: 'Item Shop',
      width: 600
    });
  }
  activateListeners(html) {
    super.activateListeners(html);
  }
}



class osrItemShopForm extends FormApplication {
  constructor(actor, shop) {
    super();
    this.actor = actor;
    this.actorId = actor.id;
    this.actorName = actor.name;
    this.shop = shop;
  }
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ['form', 'osrShopForm'],
      popOut: true,
      template: `modules/osr-item-shop/templateData/item-shop-template.html`,
      id: 'osrShopForm',
      title: 'Item Shop',
      width: 900,
      height: 800
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    const closeBtn = html.find('#close');
    const buyBtn = html.find('#buy-btn');
    buyBtn.on('click', (event) => {
      const ag = parseInt(html.find('#actor-gold')[0].innerText);
      const tp = parseInt(html.find('#total-price')[0].innerText);
      console.log(ag, tp);
      if (ag - tp < 0) {
        console.log('button blocked', event);
        ui.notifications.warn('Not Enough Gold!');
        event.preventDefault();
        return;
      }
      console.log('enough gold', event);
    });
    closeBtn.on('click', () => {
      console.log('close', this);
      this.close();
    });
  }
  async _updateObject(event, formData) {
    console.log('<------ default behavior');
    //console.log('formData', formData, this);
    const data = await buyList(formData);
    console.log(data);
    data.actor = this.actor;

    OSRIS.util.buyItems(data);
  }
}

window.osrItemShopForm = osrItemShopForm;

async function osrShopItemHtml(list) {
  let itemList = '';
  for (let item of list) {
    //console.log(item);
    const itemObj = osrItemData.find((i) => i.name == item);
    itemList +=
      `<div class="shop-item">
    <div class="item-name">` +
      itemObj.name +
      `</div>
    <div class="item-price"><b>Price:</b> ` +
      itemObj.cost +
      `GP</div>  
    <input type="number" class="item-qty shop-qty" name="` +
      itemObj.name +
      `" value="0" />    
    </div>`;
  }

  const html = `<div class="list-div">` + itemList + `</div>`;

  return html;
}

async function launchItemShop() {
  let token = canvas.tokens.controlled;
  if (token.length < 1 || token.length > 1) {
    ui.notifications.warn('Please select one token');
    return;
  }
  const actor = canvas.tokens.controlled[0].actor;
  const shop = new osrItemShopForm(actor);
  const goldItem = actor.data.items.find((i) => i.name == 'GP');
  if (!goldItem) {
    ui.notifications.error('No Gold Found');
    return;
  }
  shop.render(true);
}
async function itemShop() {
  const shop = new osrItemShopForm(actor);

  shop.render(true);
}