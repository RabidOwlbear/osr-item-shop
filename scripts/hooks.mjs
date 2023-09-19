import { registerSettings, registerReadySettings } from './settings.mjs';
import { registerOsrisData } from './data.js';
import { preloadHandlebarsTemplates } from './registerPartials.mjs';
import {
  osrItemShop,
  newItemShop,
  stockItemShop,
  buyRandomItems,
  randomBuyList,
  renderUniversalItemShop,
  renderItemShop,
  closeAllShops,
  openShopCheck
} from './item-shop/osrItemShop.mjs';
import { handleShopConfigTab } from './item-shop/osrItemShop.mjs';
import { ItemShopSelectForm } from './item-shop/item-shop-select.mjs';
import { socket } from './socket/osris-socket.mjs';
import { hideForeignPacks } from './hide-foreign-packs.mjs';
import { ItemShopConfig } from './shop-config-form.mjs';
import { NewShopApp, renderNewShopApp} from './item-shop/new-shop.mjs';

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
    OSRIS.lang = ['en','es'];
    socket.registerSocket();
    registerSettings();
    registerOsrisData();
    Hooks.call('OSRIS Registered');
    OSRIS.shopClass = osrItemShop;
    OSRIS.shop.ItemShopSelectForm = ItemShopSelectForm;
    OSRIS.shop.newItemShop = newItemShop;
    OSRIS.shop.stockItemShop = stockItemShop;
    OSRIS.shop.buyRandomItems = buyRandomItems;
    OSRIS.shop.randomBuyList = randomBuyList;
    OSRIS.shop.RUIS = renderUniversalItemShop;
    OSRIS.shop.openShopCheck = openShopCheck;
    OSRIS.shop.RIS = renderItemShop;
    OSRIS.shop.closeAll = closeAllShops;
    OSRIS.shop.ItemShopConfig = ItemShopConfig;
    OSRIS.shop.NewShop = NewShopApp
    OSRIS.shop.renderNewShopApp = renderNewShopApp
    // OSRIS.socket.register('cShopItemSell', OSRIS.customShop.cShopItemSell)
    // OSRIS.socket.register('csBuyCart', OSRIS.customShop.csBuyCart)
  });
  Hooks.once('socketlib.ready', () => {});
  Hooks.once('ready', async () => {
    await intializePackFolders();
    hideForeignPacks();
    registerReadySettings();
    openShopCheck();
    // migrateShops();
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
        //await game.settings.set('osrItemShop', 'itemList', OSE.itemData);
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
        //await game.settings.set('osrItemShop', 'itemList', OSRIS.itemData);
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
    // itemPiles accomodation
    let itemPiles = actorObj.flags?.['item-piles']?.data?.enabled || null;
    const addShopTab = await game.settings.get('osr-item-shop', 'shopConfigTab');
    const hideTab = await game.settings.get('osr-item-shop', 'gmOnlyCharConfig');
    const linkedToken = actorObj.prototypeToken.actorLink
    if (actorObj.type === 'character'  && !itemPiles) {
      if (game.system.id === 'hyperborea') {
        if (addShopTab) {
          if (!game.user.isGM && !hideTab) {
            addShopConfig(sheetEl, actorObj);
          }
          if (game.user.isGM) {
            addShopConfig(sheetEl, actorObj);
          }
        }
      } else {
        if (addShopTab) {
          if (!game.user.isGM && !hideTab) {
            handleShopConfigTab(sheetObj, sheetEl, actorObj);
          }
          if (game.user.isGM) {
            handleShopConfigTab(sheetObj, sheetEl, actorObj);
          }
        }
      }

      let imageEl = sheetEl[0].querySelector('.profile');
      // add shop button
      console.log('Add Shop Button')
      if (actorObj.owner) {
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
      }
    }
  });
}

function addShopConfig(html, actor) {
  if(!actor.prototypeToken.actorLink)return
  let tweaksEl = html.find('a.control.configure-actor')[0];
  if (tweaksEl) {
    const parentNode = tweaksEl?.parentNode;
    const btnEl = document.createElement('a');
    btnEl.classList.add('shop-config');
    btnEl.title = game.i18n.localize('OSRIS.itemShop.shopConfig');
    const img = document.createElement('i');
    img.classList.add('fas', 'fa-cog');
    btnEl.appendChild(img);
    parentNode.insertBefore(btnEl, tweaksEl);
    btnEl.addEventListener('click', (e) => {
      e.preventDefault();
      new OSRIS.shop.ItemShopConfig(actor).render(true);
    });
  }
}

async function intializePackFolders() {
  let singleGM = false;
  if (game.user.isGM && game.users.filter((u) => u.role == 4)[0]?.id === game.user.id) {
    singleGM = true;
  }
  if (singleGM) {
    const movePacks = await game.settings.get('osr-item-shop', 'makePackFolder');
    const folderName = await game.settings.get('osr-item-shop', 'packFolderName');
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const packnames = ['osr-items-en', 'osr-items-hyperborea-en', 'osr-items-es', 'osr-macros-en', 'osr-scenes-all'];
    let folder = game.folders.getName(folderName);
    if (!folder && movePacks) {
      folder = await Folder.create([{ name: folderName, type: 'Compendium', color: '#ce8b00' }]);
      packnames.forEach(async (pn) => {
        const pack = await game.packs.get(`osr-item-shop.${pn}`);
        if (pack) await pack.setFolder(folder[0]);
      });
      await sleep(140);
      ui.sidebar.render();
    }
  }
}
