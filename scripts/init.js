import {registerUtilities} from "./util.js"
import {registerOsrisData} from "./data.js"
import {registerItemShop} from "./itemShop.js"
import {registerCustomShop} from "./customShop.js"
import {registerFastpack} from "./fastPack.js"




Hooks.on('init', () => {
  
  game.settings.register('osr-item-shop', 'charBuilderCheck', {
    name: 'Add open shop checkbox to OSE character builder (if installed)',
    hint: 'Adds option to open item shop following character creation using the OSE character builder included  with the Old-School-Essentials module.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
  game.settings.register('osrItemShop', 'sourceList', {
    name: 'sourceList',
    type: Array,
    default: [],
    scope: 'world'
  });
  game.settings.register('osrItemShop', 'itemList', {
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



   //register namespace
   window.OSRIS = window.OSRIS || {};
   OSRIS.util = OSRIS.util || {};
   OSRIS.userPacks = OSRIS.userPacks || {};
   OSRIS.customShop = OSRIS.customShop || {}
   Hooks.call('OSRIS Registered')

   registerUtilities()
   registerOsrisData()
   registerItemShop()
   registerFastpack()
   registerCustomShop()

  
  OSRIS.socket = socketlib.registerModule('osr-item-shop')
  OSRIS.socket.register('gmHandleSeller', OSRIS.customShop.gmHandleSeller)
  OSRIS.socket.register('gmShopFlag', OSRIS.customShop.gmShopFlag)
  // OSRIS.socket.register('cShopItemSell', OSRIS.customShop.cShopItemSell)
  // OSRIS.socket.register('csBuyCart', OSRIS.customShop.csBuyCart)
});
Hooks.once("socketlib.ready", () => {
  
})
Hooks.once('ready', async () => {
  console.log('osrItemSHop ready');
  let ose = game.modules.get('old-school-essentials')?.active;
  
  const singleGM = game.users.filter(u=> u.role == 4)[0];
  //if old school essential module installed
  if (game.user.role >= 4 && game.user.id == singleGM.id) {
    await OSRIS.customShop.closeAllShopFlag()
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
        await game.settings.set('osrItemShop', 'sourceList', optionsObj);
        await game.settings.set('osrItemShop', 'itemList', OSRIS.itemData);

    }
  }
  Hooks.call('osrItemShopActive');
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  sleep(5000);
  let curData = game.settings.get('osrItemShop', 'sourceList');
  
  Hooks.on('renderActorSheet', OSRIS.customShop.hijackSheet);
  Hooks.on('custom-shop-process-seller', ()=>{
   OSRIS.socket.executeAsGM(`gmHandleSeller`, )
  });
});

Hooks.on('renderItemShopForm', async (formObj, html, c) => {
  
  let sourceList = await game.settings.get('osrItemShop', 'sourceList');
  const itemCont = html.find(`[id="item-list"]`)[0];
  const sourceCont = html.find(`[id="source-list"]`)[0];
  const actorGold = html.find(`span[id="actor-gold"]`)[0];
  const sList = await OSRIS.shop.listContent({ type: 'source', data: sourceList, isItem: false }, html);
  const actorGp = formObj.actor.data.items.getName('GP').data.data.quantity.value;
  
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

Hooks.on('closeCShop',async (data, html)=>{
  console.log('close sheet')
  let actor = data.actor;
  if(actor.data.flags["osr-item-shop"].customShop){
    await OSRIS.socket.executeAsGM('gmShopFlag',{actorName: actor.name, action: 'unset'})
  }

})

