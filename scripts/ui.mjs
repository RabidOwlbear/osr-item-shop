import { ItemShopSelectV2 } from './item-shop/v2/item-shop-select-v2.mjs';
import { ItemShopConfigV2 } from './item-shop/v2/item-shop-config-v2.mjs';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//handle sheet ui
export async function injectOSRUI(sheetEl, actorObj, type) {
  await sleep(Math.floor(Math.random() * 100) + 1);
  const existing = sheetEl.closest('.app.window-app').querySelector('.osrh-ui-container .button-div');
  if (existing) {
    addOSRIScontrols(existing, 'actor');
  } else {
    createOSRUI(sheetEl, actorObj, type);
  }
}
//create sheet ui
export async function createOSRUI(sheetEl, actorObj, type) {
  const existing = sheetEl.closest('.app.window-app')?.querySelector('.osrh-ui-container');
  if (existing) return;
  const data = {
    handle: true,
    buttons: OSRIS.ui[type],
    roundBottom: false
  };
  data.roundBottom = data.buttons.length > 1 ? true : false;
  const template = await foundry.applications.handlebars.renderTemplate('modules/osr-item-shop/templateData/sheet-ui/sheet-ui.hbs', data);
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template;
  const buttonEls = tempDiv.querySelectorAll('.ui-button');
  buttonEls.forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      const app = ev.target.closest('.ui-button').dataset.app;
      switch (app) {
        case 'item-shop':
          new ItemShopSelectV2({ actor: actorObj }).render(true, {
            position: {
              top: sheetEl.offsetTop,
              left: sheetEl.offsetLeft - 150
            }
          });
          break;
        case 'shop-config':
          new ItemShopConfigV2({ uuid: actorObj.uuid }).render(true, {
            position: {
              top: sheetEl.offsetTop,
              left: sheetEl.offsetLeft - 75
            }
          });
          break;
      }
    });
  });
  const templateElement = tempDiv.firstElementChild;
  sheetEl.appendChild(templateElement);
}
export async function addControlListeners(element,actorObj, type) {
  await sleep(Math.floor(Math.random() * 100) + 1);
  const buttonDiv = element.querySelector('.osrh-ui-container .button-div');
  const buttonEls = element.querySelectorAll('.ui-button');
  buttonEls.forEach((btn) => {
    const app = btn.dataset.app;
    switch (app) {
      case 'item-shop':
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          new ItemShopSelectV2({ actorId: actorObj.id }).render(true, {
            position: {
              top: element.offsetTop,
              left: element.offsetLeft - 150
            }
          });
        });
        break;
      case 'shop-config':
        btn.addEventListener('click', (ev) => {
          ev.preventDefault();
          new ItemShopConfigV2({ uuid: actorObj.uuid }).render(true, {
            position: {
              top: element.offsetTop,
              left: element.offsetLeft - 75
            }
          });
        });
        break;
    }
  });
}
//add controls to sheet ui
function addOSRIScontrols(existing, type) {
  const buttonEls = existing.querySelectorAll('.ui-button');
  if (buttonEls.length > 0 && !existing.classList.contains('multi-button')) {
    existing.classList.add('multi-button');
  }
  for (const btn of OSRIS.ui[type]) {
    const button = document.createElement('a');
    const icon = document.createElement('i');
    button.classList.add('ui-button');
    button.dataset.app = btn.app;
    button.title = btn.title;
    icon.classList.add('fas', btn.icon);
    button.appendChild(icon);
    existing.appendChild(button);
    button.addEventListener('click', (ev) => {
      const app = ev.target.closest('.ui-button').dataset.app;
      switch (app) {
        case 'item-shop':
          new ItemShopSelectV2({ actodId: actorObj.id }).render(true, {
            position: {
              top: sheetEl.offsetTop,
              left: sheetEl.offsetLeft - 300
            }
          });
          break;
        case 'shop-config':
          new ItemShopConfigV2({ uuid: actorObj.uuid }).render(true, {
            position: {
              top: sheetEl.offsetTop,
              left: sheetEl.offsetLeft - 300
            }
          });
          break;
      }
    });
  }
}
