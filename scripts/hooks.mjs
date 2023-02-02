import { registerSettings } from './settings.mjs';
import { registerOsrisData } from './data.js';
import { preloadHandlebarsTemplates } from './registerPartials.mjs';
import { osrItemShop, newItemShop, stockItemShop, buyRandomItems, randomBuyList, renderUniversalItemShop, closeAllShops} from './item-shop/osrItemShop.mjs';
import { handleShopConfigTab } from './item-shop/osrItemShop.mjs';
import { ItemShopSelectForm } from './item-shop/item-shop-select.mjs';
import { socket } from './socket/osris-socket.mjs';

export function registerHooks() {
  Hooks.on('init', () => {
    console.log(`
    --------------------------
    itemShop Loaded
    --------------------------
    `);

    //register namespace
    window.OSRIS = window.OSRIS || {};
    OSRIS.util = OSRIS.util || {};
    OSRIS.userPacks = OSRIS.userPacks || {};
    OSRIS.customShop = OSRIS.customShop || {};
    OSRIS.socket = socket;
    OSRIS.shop = {};
    socket.registerSocket();
    registerSettings();
    // registerUtilities();
    registerOsrisData();
    // registerItemShop();
    // registerFastpack();
    // registerCustomShop();
    Hooks.call('OSRIS Registered');
    // OSRIS.socket = socketlib.registerModule('osr-item-shop');
    // OSRIS.socket.register('gmHandleSeller', OSRIS.customShop.gmHandleSeller);
    // OSRIS.socket.register('gmShopFlag', OSRIS.customShop.gmShopFlag);
    OSRIS.shopClass = osrItemShop;
    OSRIS.shop.ItemShopSelectForm = ItemShopSelectForm;
    OSRIS.shop.newItemShop = newItemShop;
    OSRIS.shop.stockItemShop = stockItemShop;
    OSRIS.shop.buyRandomItems = buyRandomItems
    OSRIS.shop.randomBuyList = randomBuyList
    OSRIS.shop.RUIS = renderUniversalItemShop
    // OSRIS.socket.register('cShopItemSell', OSRIS.customShop.cShopItemSell)
    // OSRIS.socket.register('csBuyCart', OSRIS.customShop.csBuyCart)
  });
  Hooks.once('socketlib.ready', () => {});
  Hooks.once('ready', async () => {
    closeAllShops()
    migrateShops()
    preloadHandlebarsTemplates();
    console.log('osrItemSHop ready');
    let ose = game.modules.get('old-school-essentials')?.active;

    const singleGM = game.users.filter((u) => u.role == 4 && u.active)[0];
    //if old school essential module installed
    if (game.user.role >= 4 && game.user.id == singleGM.id) {

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

        await game.settings.set('osrItemShop', 'sourceList', optionsObj);
        await game.settings.set('osrItemShop', 'itemList', OSE.itemData);
      } else {
        const optionsObj = [
          {
            header: 'OSR Items',
            data: OSRIS.itemData,
            options: [
              {
                name: 'OSR Items',
                source: 'osrItemShop',
                itemTypes: [`weapons`, `armor`, `equipment`, `ammunition`]
              }
            ]
          }
        ];
        await game.settings.set('osrItemShop', 'sourceList', optionsObj);
        await game.settings.set('osrItemShop', 'itemList', OSRIS.itemData);
      }
    }
    Hooks.call('osrItemShopActive');
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    sleep(5000);
    let curData = game.settings.get('osrItemShop', 'sourceList');

    Hooks.on('custom-shop-process-seller', () => {
      OSRIS.socket.executeAsGM(`gmHandleSeller`);
    });
  });

  Hooks.on('renderItemShopForm', async (formObj, html, c) => {
    let sourceList = await game.settings.get('osrItemShop', 'sourceList');
    const itemCont = html.find(`[id="item-list"]`)[0];
    const sourceCont = html.find(`[id="source-list"]`)[0];
    const actorGold = html.find(`span[id="actor-gold"]`)[0];
    const sList = await OSRIS.shop.listContent({ type: 'source', data: sourceList, isItem: false }, html);
    const actorGp = formObj.actor.items.getName('GP').system.quantity.value;

    actorGold.innerText = `${actorGp}`;

    sourceCont.innerHTML = sList.content;

    const sItems = await OSRIS.shop.listContent({
      type: 'items',
      data: sourceList,
      selected: sList.selected,
      isItem: false
    });
    let sInputs = html.find(`[id="source-list"] input`);
    for (let input of sInputs) {
      input.addEventListener('input', async () => {
        let listContent = await OSRIS.shop.listContent({
          type: 'items',
          data: sourceList,
          selected: input.value,
          isItem: false
        });
        itemCont.innerHTML = listContent;
        let plus = html.find(`[id="button-plus"]`);
        let minus = html.find(`[id="button-minus"]`);

        for (let button of plus) {
          button.addEventListener('click', () => {
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

    itemCont.innerHTML = sItems;

    let plus = html.find(`[id="button-plus"]`);
    let minus = html.find(`[id="button-minus"]`);

    for (let button of plus) {
      button.addEventListener('click', () => {
        OSRIS.shop.shopAddItem(html, button.value, 'plus');
      });
    }
    for (let button of minus) {
      button.addEventListener('click', () => {
        OSRIS.shop.shopAddItem(html, button.value, 'minus');
      });
    }
  });

  Hooks.on('closeCShop', async (data, html) => {
    let actor = data.actor;
    if (actor.flags['osr-item-shop']?.customShop) {
      await OSRIS.socket.executeAsGM('gmShopFlag', { actorName: actor.name, action: 'unset' });
    }
  });
  Hooks.on('renderActorSheet', async (sheetObj, sheetEl, actorObj) => {
    let hideTab = game.settings.get('osr-item-shop', 'gmOnlyCharConfig');
    if (!game.user.isGM && !hideTab) {
      handleShopConfigTab(sheetObj, sheetEl, actorObj);
    }
    if (game.user.isGM) {
      handleShopConfigTab(sheetObj, sheetEl, actorObj);
    }

    let imageEl = sheetEl[0].querySelector('.profile');
    // add shop button
    const shopBtnEl = document.createElement('a');
    shopBtnEl.classList.add('shop-button');
    const shopBtnImg = document.createElement('i');
    shopBtnImg.classList.add('fa-solid', 'fa-store');
    shopBtnEl.appendChild(shopBtnImg);
    imageEl.appendChild(shopBtnEl);
    shopBtnEl.addEventListener('click', (ev) => {
      ev.preventDefault();
      new OSRIS.shop.ItemShopSelectForm(actorObj._id).render(true);
    });
  });
}

// remove after version 0.2.1
async function migrateShops(){
  const singleGM = game.users.filter(u=>u.role == 4 && u.active)[0].id;
  if(game.user.id == singleGM){
    let actors = game.actors.filter(a=>{ 
      let hasFlag = a.getFlag('osr-item-shop', 'customShop');
      if(hasFlag != undefined){
        return a
      }
    })
    if(actors.length){
      ui.notifications.notify('OSR-Item-Shop: Beginning Update Of Custom Shops.');
      for(let actor of actors){
        actor.setFlag('osr-item-shop', 'shopConfig',{shopName: actor.name, enabled: true});
        actor.unsetFlag('osr-item-shop', 'customShop')
      }
      ui.notifications.notify('OSR-Item-Shop: Custom Shops Update Complete.');
    }
  }
  
}