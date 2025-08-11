import { ItemShopSelectV2 } from './item-shop/v2/item-shop-select-v2.mjs';
import { ItemShopConfigV2 } from './item-shop/v2/item-shop-config-v2.mjs';
export const uiButtons = {
  actor: [
    {
      id: 'osr-item-shop-btn-0',
      title: "OSRIS.shopSelect.title",
      group: 'osris',
      icon: 'fa-solid fa-shop',
      onClick: (ev, actor) => {
        new ItemShopSelectV2({ actor: actor, actorId: actor.id }).render(true, {
            position: {
              top: ev.clientY,
              left: ev.clientX - 150
            }
          });
      }
    },
    {
      id: 'osr-item-shop-btn-1',
      title: "OSRIS.itemShop.shopConfig",
      group: 'osris',
      icon: 'fa-solid fa-gear',
      onClick: (ev, actor) => {
        new ItemShopConfigV2({ uuid: actor.uuid }).render(true, {
            position: {
              top: ev.clientY,
              left: ev.clientX - 75
            }
          });
      }
    }
  ],
  item: []
}