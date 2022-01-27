Hooks.on('OSRIS Registered', () => {
  OSRIS.fp = OSRIS.fp || {};
  OSRIS.fp.fastPackList = function (selection, actorClass) {
    let cItem;
    switch (actorClass) {
      case 'Cleric':
        cItem = 'Holy Symbol';
        break;
      case 'Thief':
        cItem = 'Thieves Tools';
        break;
      default:
        cItem = 'HolyWater (vial)';
    }
    const fastPack = {
      a: {
        price: 38,
        items: [
          { name: 'Backpack', qty: 1 },
          { name: 'Sack (large)', qty: 1 },
          { name: 'Lantern', qty: 1 },
          { name: 'Oil (1 flask)', qty: 2 },
          { name: 'Tinder Box (flint and steel)', qty: 1 },
          { name: 'Iron Spikes (12)', qty: 1 },
          { name: 'Hammer (small)', qty: 1 },
          { name: 'Waterskin', qty: 1 },
          { name: 'Rations (standard, 7 days)', qty: 1 }
        ]
      },
      b: {
        price: 32,
        items: [
          { name: 'Backpack', qty: 1 },
          { name: 'Sack (large)', qty: 2 },
          { name: 'Torches (6)', qty: 1 },
          { name: 'Oil (1 flask)', qty: 3 },
          { name: 'Tinder Box (flint and steel)', qty: 1 },
          { name: `Pole (10' long, wooden)`, qty: 1 },
          { name: `Rope (50')`, qty: 1 },
          { name: 'Waterskin', qty: 1 },
          { name: 'Rations (standard, 7 days)', qty: 1 },
          { name: 'Mirror (hand sized, steel)', qty: 1 }
        ]
      },

      c: {
        price: 42,
        items: [
          { name: 'Backpack', qty: 1 },
          { name: 'Sack (small)', qty: 4 },
          { name: cItem, qty: 1 },
          { name: 'Iron Spikes (12)', qty: 1 },
          { name: `Rope (50')`, qty: 1 },
          { name: 'Waterskin', qty: 1 },
          { name: 'Rations (standard, 7 days)', qty: 1 }
        ]
      }
    };
    return fastPack[selection];
  };

  OSRIS.fp.fastPackDialog = function (actor) {
    const actorClass = actor.data.data.details.class;
    const gold = actor.data.items.getName('GP').data.data.quantity.value;
    let template = ``;
  };

  OSRIS.fp.fastPack = class fastPack extends Application {
    constructor(actor) {
      super();
      this.actor = actor;
      this.gold = actor.data.items.getName('GP')?.data.data.quantity.value;
      this.class = actor.data.data.details.class;
    }
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ['application', 'fast-pack-app'],
        popOut: true,
        template: `modules/osr-item-shop/templateData/fastpack-template.html`,
        id: 'fastPack',
        title: 'Ye Fast Pack',
        width: 500
      });
    }

    activateListeners(html) {
      super.activateListeners(html);
      const buy = html.find('#fastPackBuy');
      const close = html.find('#fastPackClose');
      const gpItem = this.actor.data.items.getName('GP');

      buy.on('click', async (event) => {
        if (gpItem) {
          const gold = gpItem.data.data.quantity.value;
          const selected = html.find("input[type='radio'][name='pack-select']:checked")[0].value;
          const itemList = OSRIS.fp.fastPackList(selected, this.actor);

          let pack = OSRIS.fp.fastPackList(selected, this.class);
          if (gold >= pack.price) {
            await OSRIS.util.addPackItems(this.actor, itemList.items);
            const newGp = gold - itemList.price;
            await gpItem.update({ data: { quantity: { value: newGp } } });
          } else {
            ui.notifications.warn('Not Enough Gold!');
          }

          this.close();
        } else {
          ui.notifications.error('Item named GP not found.');
        }
      });
      close.on('click', () => {
        this.close();
      });
    }
  };
  OSRIS.fp.renderFastPack = async function () {
    const numSelected = canvas.tokens.controlled;
    if (numSelected > 1 || numSelected == 0) {
      ui.notifications.warn('Please select one token');
      return;
    }
    const actor = canvas.tokens.controlled[0].actor;
    new OSRIS.fp.fastPack(actor).render(true);
  };
});
