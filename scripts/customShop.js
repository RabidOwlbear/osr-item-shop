export const registerCustomShop = () => {
  OSRIS.openShops = [];

  OSRIS.customShop.hijackSheet = async function (aData, html, data) {
    let test = html.find('#char-select');
    // data
    let charActors = game.actors.filter((a) => {
      if (a.type == 'character' && a.permission[game.user.id] && a.permission[game.user.id] > 2) {
        return a;
      }
    });
    let tdHeader = {
      name: aData.actor.name,
      portrait: {
        img: `/modules/osr-item-shop/img/owlbear.webp`
      },
      chars: charActors,
      template: 'modules/osr-item-shop/templateData/custom-shop/header.html'
    };
    let tdShop = {
      template: 'modules/osr-item-shop/templateData/custom-shop/shop.html'
    };

    let actor = aData.actor;
    let flagged = await actor.getFlag('osr-item-shop', 'customShop');

    if (flagged) {
      console.log(`It's a shop!!!!!!`);
      // render templates
      let headerHtml = await renderTemplate(tdHeader.template, tdHeader);
      let shopHtml = await renderTemplate(tdShop.template, tdShop);

      // grab elements
      let sheetHtml = document.querySelector(`#actor-${aData.actor.id}`);
      let attrib = sheetHtml.querySelector(`.tab[data-tab="attributes"]`);
      let abil = sheetHtml.querySelector(`.tab[data-tab="abilities"]`);
      let nav = sheetHtml.querySelector(`nav`);
      let img = sheetHtml.querySelector(`.profile-img`);
      let details = sheetHtml.querySelector(`section.header-details`);
      let imgCont = sheetHtml.querySelector(`.profile`);
      let modBar = sheetHtml.querySelector(`.modifiers-btn`);
      let rszHndl = document.querySelector(`#actor-${aData.actor.id} .window-resizable-handle`);
      let invCont = document.querySelector(`[data-tab="inventory"] section.inventory`);

      /*  set styles  */
      // hide resize
      rszHndl.style.display = 'none';
      // image styling
      modBar.style.width = '100px';
      img.style = 'width: 100px; height: 100px';
      imgCont.style = `height: 100px; width: 100px ; flex: 0 0 100px;`;
      invCont.style.height = `385px`;
      // inject html

      if (img.src == `/icons/svg/mystery-man.svg`) {
        img.src = `{tdHeader.portrait.img}`;
      }

      details.innerHTML = headerHtml;
      attrib.innerHTML = shopHtml;
      nav.innerHTML = `
       <a class="item active" data-tab="attributes"> Shop </a>
       <a class="item" data-tab="inventory"> Inventory </a>
       <a class="item" data-tab="notes"> Notes </a>
      `;
      // attrib.innerHTML = `<h1>Testing</h1>`
      let tabs = sheetHtml.querySelectorAll('a.item');
      nav.style['justify-content'] = 'left';
      for (let tab of tabs) {

        tab.style[`margin-right`] = '20px';
      }
      let shopBtn = document.querySelector(`#actor-${aData.actor.id} #shop-btn`);
      shopBtn.addEventListener('click',async  (e) => {
        e.preventDefault()
        
        let shopOpen = actor.getFlag('osr-item-shop', 'shopOpen');
        
        if(shopOpen){
          let customer = await actor.getFlag('osr-item-shop', 'shopCustomer')
          ui.notifications.warn(`${customer} is using the shop. Please Wait.`)
          return
        }else{
          
          await OSRIS.socket.executeAsGM('gmShopFlag',{actorName: actor.name, user: game.user, action: 'set'})
          OSRIS.customShop.renderCShop(actor, aData);
        }
        
      });

      await OSRIS.customShop.getInvHtml(actor);
    }
  };

  OSRIS.customShop.newShop = async function (data) {
    let {name, folder, gold, remainder, appendNumber, stock} = data
    const defaultName ='Custom Shops'
    let suff =  appendNumber ? ` - ${Math.floor(Math.random()* 100 + 1)}` : ``
    name = name ? `${name}${suff}` : `Custom Shop${suff}`
    folder = folder ? game.folders.getName(folder) : game.folders.getName(defaultName);
    if (!folder){
        folder = await Folder.create({
        name: defaultName,
        color: '#371150',
        type: 'Actor',
        parent: null
      });
    }
    const aData = {
            name: name,
            type: 'character',
            img:`modules/osr-item-shop/img/owlbear.webp`,
            permission: {default: 2},
            folder: folder.id,
            token: {actorLink: true}
          };
    let actor = await Actor.create(aData)
    actor.setFlag('osr-item-shop', `customShop`, true)
    let pack = game.packs.get('osr-item-shop.osr items');
      let gpId = pack.index.contents.find((a) => a.name == 'GP')._id;
      const blankGp = await pack.getDocument(gpId);
      
      let gData = blankGp.clone();
      await actor.createEmbeddedDocuments('Item', [gData]);
      let goldItem = actor.items.getName('GP');
      await goldItem.update({data:{quantity:{value: gold}}})
    if(stock){
      OSRIS.customShop.stockShop(actor, remainder);
      
    }
  };

  OSRIS.customShop.cShopItemList = async function (items) {
    let retHtml = ``;
    for (let item of items) {
      retHtml += `
      <div class="shop-item">
        <div class="item-name">${item.name}</div>
        <div class="item-price">${item.cost}GP</div>  
        <div class="qty-btn-div">
          <button type="button" class="shop-item-btn button-minus" id="" value="${item.id}"><i class="fas fa-minus-square"></i></button>
          <button type="button" class="shop-item-btn button-plus" id="" value="${item.id}"><i class="fas fa-plus-square"></i></button>
        </div>
      </div>`;
    }
  };

  OSRIS.customShop.CShop = class CShop extends FormApplication {
    constructor(object, options, actor, shopSheet) {
      super(object, options);
      this.actor = actor;
      this.actorId = actor.id
      this.formId = `cs-${actor.id}`;
      this.shopSheet = shopSheet;
    }
    static get defaultOptions() {
      return super.defaultOptions;
    }
    getData(options = {}) {
      return super.getData().object;
    }
    activateListeners(html) {

      let hideAll = () => {
        let panels = html.find('.c-shop-cont');
        for (let panel of panels) {
          panel.style.display = 'none';
        }
      };
      let resetTabStyle = () => {
        let tabs = html.find('a.nav-tab');
        for (let tab of tabs) {
          tab.style['background-color'] = 'rgb(172, 172, 172)';
          tab.style.color = 'black';
        }
      };

      
      // tabs
      const tabs = html.find(`.nav-tab`);
      for (let tab of tabs) {
        tab.addEventListener('click', (e) => {
          e.preventDefault()
          let targetPanel = html.find(`#${tab.name}`)[0];
          hideAll();
          resetTabStyle();
          targetPanel.style.display = 'block';
          tab.style['background-color'] = 'green';
          tab.style.color = 'white';
        });
      }
      // char select
      const select = html.find('#char-select')[0];
      select.addEventListener('change', async (e) => {
        if(select.value != 'none'){
          let buyerActor = game.actors.get(select.value);
          let actorGold = await buyerActor.items.getName('GP')?.system.quantity?.value;
          actorGold = actorGold ? actorGold : 0
          let actorGoldField = html.find(`#actor-gold`)[0];
          actorGoldField.innerText = actorGold;
          let imgEl = html.find('#buyer-portrait')[0];
          imgEl.src = buyerActor.img;
          OSRIS.customShop.renderSellPanelInv(buyerActor, this.actor, html)
        }
        
      });

      //item buttons
      const itemAddBtns = html.find('button.button-plus');
      const itemMinusNtns = html.find('button.button-minus');
      let addListeners = (arr, state)=>{
        
        for(let btn of arr){
          btn.addEventListener('click',async  (e)=>{
            const select = html.find('#char-select')[0];
            e.preventDefault()
            OSRIS.customShop.csCartItem({
              state: state,
              html: html,
              itemId: btn.value,
              selectedActor: await game.actors.get(select.value),
              shopActor: this.actor,
              target: 'buyCart',
              totalElId: `cs-cart-total`
            })
          })
        }
      }
      addListeners(itemAddBtns, `plus`)
      addListeners(itemMinusNtns, `minus`)

      // buy buttons
      let resetBuyCartBtn = html.find('#reset-buy-cart')[0]
      let buyCartBtn = html.find(`#buy-items`)[0]

      resetBuyCartBtn.addEventListener('click',(e)=>{
        
        e.preventDefault()
        let cartCont = html.find('#cs-cart-div')[0]
        let total = html.find(`#cs-cart-total`)[0]

        cartCont.innerHTML = ``
        total.innerText = '0'

      })
      //sell buttons
      let sellCartBtn = html.find('#sell-items')[0];
      let resetSellCartBtn = html.find('#reset-sell-cart')[0]
      sellCartBtn.addEventListener('click',async  e=>{
        e.preventDefault()
        const selectedActor = await game.actors.get(html.find('#char-select')[0].value)
        const data = { 
          selectedActor: selectedActor,
          shopActor: this.actor,
          shop: this,
          html: html
        }
        
        OSRIS.customShop.cShopItemSell(data)
      
      })

      resetSellCartBtn.addEventListener('click', e=>{
        e.preventDefault()
        
        OSRIS.customShop.resetSellCart(html)
      })

      buyCartBtn.addEventListener('click',async (e)=>{
        e.preventDefault()
        let total = parseInt(html.find(`#cs-cart-total`)[0].innerText)
        const select = html.find('#char-select')[0];
        let buyerId = select.value
        
        if(buyerId == 'none'){
          ui.notifications.warn('Please Select A Character.')
          return
        }

        let buyerActor = game.actors.get(select.value);
        let actorGold = await buyerActor.items.getName('GP')?.system?.quantity?.value;

        if(total > actorGold){
          ui.notifications.warn('Not Enough Gold!')
          return
        }
        OSRIS.customShop.csBuyCart({
          seller: this.actor,
          buyer: game.actors.get(buyerId),
          html: html,
          shop: this,
          sellerId: this.actorId
        })
        // OSRIS.socket.executeAsGM('csBuyCart',{
        //   seller: this.actor,
        //   buyer: game.actors.get(buyerId),
        //   html: html,
        //   shop: this,
        //   sellerId: this.actorId
        // })

      })
    }
    async _updateObject(event, formData) {}

  };
  OSRIS.customShop.renderCShop = async function (actor = null, shopSheet) {
    let charActors = game.actors.filter((a) => {
      if (a.type == 'character' && a.permission[game.user.id] && a.permission[game.user.id] > 2) {
        return a;
      }
    });
    let itemHtml = await OSRIS.customShop.getInvHtml(actor);
    const options = {
      // baseApplication: 'customShopLoad',
      classes: [`form`, `custom-shop`],
      popOut: true,
      title: `Shop Panel - ${actor.name}`,
      template: `modules/osr-item-shop/templateData/custom-shop/custom-shop.html`,
      id: `cs-${actor.id}`,
      width: 450,
      height: 600,
    };
    let obj = {
      name: actor.name,
      shopGp: actor.items.find(i=>i.name == 'GP').system.quantity.value,
      items: `${itemHtml}`,
      chars: charActors,
      portrait: {
        seller: actor.img,
        buyer: '/icons/svg/mystery-man.svg'
      }
    };
    let cShop = new OSRIS.customShop.CShop(obj, options, actor, shopSheet);
    cShop.render(true);
  };


  OSRIS.customShop.getInvHtml = async function (actor) {
    let items = actor.items.filter(i=>i.type != 'ability' && i.type != 'spell' && i.type != 'container' && i.name != 'GP');
    let itemList = ``;
    if (items) {
      let itemTypes = [];
      let sortedItems = [];
      for (let i of items) {
        if (!itemTypes.includes(i.type)) {
          itemTypes.push(i.type);
        }
      }

      for (let type of itemTypes) {
        let groupItems = items.filter((i) => i.type == type);
        sortedItems.push({ 
          type: type,
          items: groupItems //type == 'item' ? groupItems.filter(i=>i.type != 'ability' && i.type != 'spell' && i.type != 'container' && i.name != 'GP') :
        });
      }
      for (let group of sortedItems) {
        let groupHtml = ``;
        let groupItems = [];
        for(let item of group.items){
          if(!groupItems.find(i=>i.name == item.name)){
            let itemCount = group.items.filter(i=>i.name == item.name).length;
            let isMagic = item.system?.manualTags?.find((t) => t.value == 'Magic');
            groupItems.push({
              name: item.name,
              id: item.id,
              cost: item.system.cost,
              qty: itemCount,
              magic: item.system?.manualTags?.find((t) => t.value == 'Magic') ? `magic-item` : ``,
              typeColor: isMagic ?  `magic-item` :`cs-${item.type}`,
              template: `modules/osr-item-shop/templateData/custom-shop/shop-item.html`
            })
         }
        };
      
        for (let data of groupItems) {
          // let tData = {
          //   name: i.name,
          //   qty: i.system.quantity.value,
          //   cost: i.system.cost,
          //   id: i.id,
          //   magic: i.system?.manualTags?.find((t) => t.value == 'Magic') ? `magic-item` : ``,
          //   typeColor: `cs-${i.type}`,
          //   template: `modules/osr-item-shop/templateData/custom-shop/shop-item.html`
          // };

          let iHtml = await renderTemplate(data.template, data);
          groupHtml += iHtml;
        }
        itemList += `
            <div class="type-header">${group.type}</div>
            ${groupHtml}
          `;
      }
    }
    return itemList;
  };

  OSRIS.customShop.csCartItem = async function(data){
    
    let { state, html, itemId,shopActor, selectedActor, target, totalElId} = data
    let actor = target == 'buyCart' ? shopActor : selectedActor;
    
    let cartCont = target == 'buyCart' ? html.find(`#cs-cart-div`)[0] :
                   target == 'sellCart' ? html.find(`#actor-inventory`)[0] : null
    
    // let cartCont = html.find(`#cs-cart-div`)[0]
    let inp = cartCont.querySelector(`[name='${itemId}']`);
    const tPrice = html.find(`span[id="${totalElId}"]`)[0];
    let actorInv = actor.items
    let item = actorInv.get(itemId)
    let itemQty = actorInv.filter(i=>i.name == item.name).length;
    //set initial element quantint value
    let elQty = target == 'buyCart' ? 1 : 0

    let updateSellTotal = (item, html)=>{
      const totalEl = html.find(`#sell-total`)[0]
      
    }
    if(state == 'plus'){
      let itemObj = await actorInv.get(itemId)

      if(inp){
        if(parseInt(inp.value) < itemQty){
        let newValue = parseInt(inp.value) + 1;
        inp.value = `${newValue}`;

        let itemDiv = html.find(`[id="${itemId}"]`);
        let price = itemDiv.find(`[class="cs-item-price cart-price"]`)[0];
        price.innerText = `${parseInt(price.innerText) + itemObj.system.cost}GP`;
        } else {
          return
        }
      }else{
        let cartType = state == 'buyCart' ? `buy-cart` : `sell-cart`
        let sellQty = target == 'sellCart' ? `<div class="sell-item-qty-cont"> / <span id="sell-item-qty">${itemQty}</span></div>` : ``
        let el = document.createElement('div');
        el.id = itemId;
        el.className = `cs-item-cont ${cartType}`;
        el.innerHTML = `<div class="c-shop-item cart-item">
        <div class="cs-item-name">${itemObj.name}</div>
        <div class="cs-cart-price-cont">
        <div class="cs-item-price cart-price">${itemObj.system.cost}GP</div> 
        <div class="fx"> 
        <input type="number" class="cs-item-qty shop-qty cart-item" onfocus="if(this.value == '${elQty}') { this.value = ''; }" name="${itemObj.id}" value="${elQty}" />
        ${sellQty}
        </div>
        </div>
        </div>`
        cartCont.appendChild(el)
        inp = cartCont.querySelector(`[name='${itemId}']`);
        inp.addEventListener('blur', (ev) => {
          ev.preventDefault()
          
          setTimeout(() => {
            let price = html.find(`[id="${itemId}"] [class="cs-item-price cart-price"]`)[0];
            let itemEl = html.find(`[id="${itemId}"]`)[0];
            

            if(target == 'buyCart'){ 
              if (parseInt(inp.value) <= 0 || inp.value == '') {

                  tPrice.innerText = `${parseInt(tPrice.innerText) - parseInt(price.innerText)}`

                  itemEl.remove();
              
              } else {
                if(inp.value > itemQty) inp.value = itemQty
                let oldPrice = parseInt(price.innerText);
                
                let newPrice = itemObj.system.cost * parseInt(inp.value);
                newPrice = newPrice < 0 ? 0 : newPrice
                
                price.innerText = `${newPrice}GP`;
                if (newPrice > oldPrice) {
                  
                  if(target == 'buyCart')tPrice.innerText = `${parseInt(tPrice.innerText) + (newPrice - oldPrice)}`;
                  if(target == 'sellCart'){
                    
                    tPrice.innerText = `${parseInt(tPrice.innerText) + (newPrice)}`
                  };

                } else {
                  
                  tPrice.innerText = `${parseInt(tPrice.innerText) - (oldPrice - newPrice)}`;

                }
              }
            }
            if(target == 'sellCart'){
              let getTotal = ()=>{
                let total = 0
                let itemEls = cartCont.querySelectorAll('.cs-item-cont')
                for(let el of itemEls){
                let price = parseInt(el.querySelector('.cs-item-price.cart-price').innerText);
                let qty = el.querySelector('.cs-cart-price-cont input').value
                total += price * qty
                }
                return total
              }
              if (parseInt(inp.value) <= 0) {
                inp.inerText = 0
                inp.value = 0
                tPrice.innerText = getTotal()
              }else{
                if(inp.value > itemQty) inp.value = itemQty
                
                tPrice.innerText = getTotal()
              }
              
            }
          }, 300);
        });
        inp.addEventListener('keypress', (e)=>{
            if (e.keyCode === 13 || e.which == '13') {
              e.preventDefault();
              if(inp.value > itemQty) inp.value = itemQty
              inp.blur()
              
            }
          })
      }
      if(target == `buyCart`)tPrice.innerText = `${parseInt(tPrice.innerText) + itemObj.system.cost}`;
      



      
    }
    if(state == 'minus'){
      const itemObj = actorInv.get(itemId);
      const itemPrice = html.find(`[id="${itemId}"][class="cs-item-price cart-price"]`);
      let itemDiv = html.find(`[id="${itemId}"]`);
      let price = itemDiv.find(`[class="cs-item-price cart-price"]`)[0];
      if (inp) {
        tPrice.innerText = `${parseInt(tPrice.innerText) - itemObj.system.cost}`;
        price.innerText = `${parseInt(price.innerText) - itemObj.system.cost}GP`;
        inp.value = parseInt(inp.value) - 1;
        if (inp.value <= 0) {
          let item = html.find(`[id="${itemId}"]`)[0];
          item.remove();
        }
      }
    }
    
  }

  OSRIS.customShop.csBuyCart= async function(data){
    let {buyer, seller, html, shop, sellerId} = data;
    
    let cartTotal = parseInt(html.find('#cs-cart-total')[0].innerText)
    
    let shopActorSheet = document.querySelector(`#actor-${seller.id}`)
    let sellerInv = seller.items
    let buyerGold = buyer.items.getName('GP');
    let bgQty = buyerGold.system.quantity.value
    let sellerGold = seller.items.getName('GP');
    let sgQty = sellerGold.system.quantity.value
    
    let cartList = html.find(`#cs-cart-div .cs-item-cont`)
    let sellerData = {
      state: 'buy',
      actor: buyer,
      actorId: buyer.id,
      shopActor: seller,
      goldItem: sellerGold,
      total: cartTotal,
      items: [],
      shopId: sellerId
    }
    for(let item of cartList){
      
      let qty = item.querySelector(`input`).value;
      let itemObj = await sellerInv.get(item.id)
      
      for(let i=0; i< qty; i++){
        
        
        let data = itemObj.clone()
        await buyer.createEmbeddedDocuments('Item', [data]);
      }
      sellerData.items.push({name: itemObj.name, qty: qty, cost: itemObj.system.cost})
    }
    let newSGQty = sgQty + cartTotal;
    let newBGQty = bgQty - cartTotal;
    
    await buyerGold.update({data:{quantity:{value: newBGQty}}})
    sellerData.newGoldAmt = newSGQty
    // await sellerGold.update({data:{quantity:{value: newSGQty}}})
    OSRIS.socket.executeAsGM(`gmHandleSeller`, sellerData)
    // close sheet and shop
    // await OSRIS.socket.executeAsGM('gmShopFlag',{actorName: seller.name, action: 'unset'})
    if(await game.settings.get('osr-item-shop', 'buyMessageCheck')){
      let msgData = {
      type: 'buy',
      actor: buyer,
      shop: seller,
      total : cartTotal,
      items: sellerData.items
      }
      await OSRIS.customShop.cartMsg(msgData)
    }
    if(data.shop.shopSheet) data.shop.shopSheet.close()
    data.shop.close()
  }
  OSRIS.customShop.cartMsg = async function (data){
    let {type, items, shop, actor, total} = data;
    let transType = type == 'buy' ? `Bought` : type == 'sell' ? 'Sold' : null
    if(!transType){
      ui.notifications.error('type not found');
      return
    }
    let itemList = ``
    for(let i of items){
      if(i.qty){
        itemList += `
       <div style = "display: flex; justify-content: space-between;">
       
         <div style="display: flex; justify-content: space-between; width: 200px;">
           <div style="width: 150px; white-space: nowrap; overflow:hidden; text-overflow: ellipsis;"> - ${i.name}</div>
           <div style="width: 30px">&nbsp<b>x</b> ${i.qty}</div>
         </div>
         
         <div style="display: flex; justify-content: space-between; width: 50px">
           <div style="width: 35px">cost:</div>
           <div>${i.cost * i.qty}</div>
         </div>
       </div>`
    }
      }
       
    let msgContent = `
    <details open>
    <summary>
    <h3 style="display: inline">${actor.name}</h3>
    </summary>
    <p></p>
     <div style="border-bottom: 2px solid black; margin-bottom: 3px;">${transType} the following Items for: ${total}GP</div>
     ${itemList}
     </details>`

    let whisper = await game.settings.get('osr-item-shop', 'cartMsgWhisper') ? game.users.filter(u=>u.isGM) : [];
    ChatMessage.create({
      speaker: game.user,
      content: msgContent,
      whisper: whisper
    })
    
  }
  OSRIS.customShop.cShopItemSell = async function(data){
    const {selectedActor, shopActor, shop, html} = data;
    
    const sellCont = document.querySelector('#actor-inventory')
    const sActorInv = selectedActor.items.filter(i=>i.type != 'ability' && i.type != 'spell' && i.type != 'container' && i.name != 'GP' && i.name != 'PP' && i.name != 'EP' && i.name != 'SP' && i.name != 'CP');
    const shopGpObj = shopActor.items.find(i=>i.name == 'GP');
    let sActorGpObj = selectedActor.items.find(i=>i.name == 'GP')
    let shopGp = shopGpObj.system.quantity.value;
    let shopActorSheet = document.querySelector(`#actor-${shopActor.id}`);
    const totalGp = parseInt(html.find('#sell-total')[0].innerText);
    
    let itemInputs = html.find('#actor-inventory input')
    
    let sList = []
    for(let item of html.find('.cs-item-cont.sell-cart')){
      
      let itemObj = await sActorInv.filter(i=>i.id == item.id)[0]
      let itemSet = await sActorInv.filter(i=>i.name == itemObj.name)
      let inp = item.querySelector('input')
      
      sList.push({
        name: itemObj.name,
        objList: itemSet,
        qty: parseInt(inp.value),
        cost: itemObj.system.cost
      })

    }
    
    if(sList.length){
      
      if(shopGp - totalGp >=0){
        
        let data = {
          state: 'sell',
          actor: selectedActor,
          actorId: selectedActor.id,
          shopActor: shopActor,
          goldItem: sActorGpObj,
          total: totalGp,
          items: sList,
          shopId: shopActor.id
        }
        await OSRIS.socket.executeAsGM(`gmHandleSeller`, data)

        for(let item of sList){
          // const itemName = sActorInv.find(i=>i.id == item.id).name
          
          if(item.qty){
            for(let i = 0; i < item.qty; i++){
              await item.objList[i].delete()
            }
          }
        }
        let updatedActorGp = sActorGpObj.system.quantity.value + totalGp
        await sActorGpObj.update({data:{quantity:{value: updatedActorGp}}})
        // await shopGpObj.update({data:{quantity:{value: shopGp - totalGp}}})
        if(await game.settings.get('osr-item-shop', 'sellMessageCheck')){
          
          let msgData = {
          type: 'sell',
          actor: selectedActor,
          shop: shopActor,
          total : totalGp,
          items: sList
          }
          await OSRIS.customShop.cartMsg(msgData)
        }
        shop.close()
        
        shop.shopSheet.close()
        return
      }
       if(shopGp - totalGp < 0){
        ui.notifications.warn('Buyer has insufficient gold!')
        return;
      }
    }else{
      ui.notifications.warn('No items selected!')
    }
  }

  OSRIS.customShop.gmHandleSeller = async function(data){
   
      let {actorId, shopId, items, newGoldAmt, state, total} = data;
      let actor = await game.actors.get(actorId);
      let shop = await game.actors.get(shopId);
      let goldItem = await shop.items.getName('GP')
      // let itemList = data.actor.items
      
      if(state == 'buy'){
        for(let item of items){
          
          for(let i=0; i<item.qty;i++){
            let itemObj = await shop.items.getName(item.name);
            await itemObj.delete()
          }
        }
        await goldItem.update({data:{quantity:{value: newGoldAmt}}})
      }
      if(state == 'sell'){
        for(let item of items){
          for (let i = 0; i < item.qty; i++){
            
            let itemObj = actor.items.getName(item.objList[i].name)
            
            const data = itemObj.clone();
            await shop.createEmbeddedDocuments('Item', [data]);
          }
        }
        newGoldAmt = goldItem.system.quantity.value - total
        await goldItem.update({data:{quantity:{value: newGoldAmt}}})
      }
      
    
    

  }
  OSRIS.customShop.stockShop = async function(actor, remainder){
    remainder = remainder ? remainder : 50 + Math.floor((Math.random() * 10))
    
    const compendium = await game.packs.get('osr-item-shop.osr items');
    const list = OSRIS.itemData;
    let gpObj = actor.items.getName('GP')
    let initGP = gpObj.system.quantity.value;
    let gpTarget = initGP - remainder
    let gpTotal = 0
    let loop = true
    while(loop){
      let curItem = list[Math.floor(Math.random() * list.length)];
      let qty = Math.floor(Math.random() * 5);
      if(gpTotal + (curItem.cost * qty) <= gpTarget){
        gpTotal += curItem.cost * qty
        const itemData = await compendium.index.getName(curItem.name);
        const itemObj = await compendium.getDocument(itemData._id);
        for(let i = 0; i < qty; i++){
          await actor.createEmbeddedDocuments('Item', [itemObj])
        }
        if(gpTotal >= gpTarget) loop = false
      }
     
      
    }
    
    gpObj.update({data:{quantity:{value: remainder}}})
  }

  OSRIS.customShop.gmShopFlag = async function (data){
    let {actorName, user, action} = data;
    
    let actor = await game.actors.getName(actorName);
    if(actor && action == 'set'){
      
      await actor.setFlag('osr-item-shop', 'shopOpen', true)
      await  actor.setFlag('osr-item-shop', 'shopCustomer', user.name)
    }
    if(actor && action == 'unset'){
      await actor.unsetFlag('osr-item-shop', 'shopOpen');
      await actor.unsetFlag('osr-item-shop', 'shopCustomer')
    }
    if(!actor){
      console.log(`no actor found`, actorName)
    }
  }
  OSRIS.customShop.closeAllShopFlag = async function(){
      let flagged = game.actors.filter(a=> a.flags?.["osr-item-shop"]?.shopOpen);
      
      if(flagged.length){
        for(let actor of flagged){
          await actor.unsetFlag('osr-item-shop', 'shopOpen')
        }
      }
  }
  OSRIS.customShop.renderSellPanelInv= async function (selectedActor, shopActor, html){
    const items = selectedActor.items.filter(i=>i.type != 'ability' && i.type != 'spell' && i.type != 'container' && i.name != 'GP' && i.name != 'PP' && i.name != 'EP' && i.name != 'SP' && i.name != 'CP');
    let itemNames = []
    items.map(i=> {if(!itemNames.includes(i.name)){ itemNames.push(i.name)}});
    
    let el = html.find('#actor-inventory')[0]
    el.innerHTML = ``
    
    for(let name of itemNames){
      let item = items.filter(i=>i.name == name)[0];
      
      OSRIS.customShop.csCartItem({
        state: 'plus',
        html: html,
        itemId: item.id,
        shopActor: shopActor,
        selectedActor: selectedActor,
        target: 'sellCart',
        totalElId: 'sell-total'
      })
    }
  }
  OSRIS.customShop.resetSellCart = function(html){
    let totalCont = html.find(`#sell-total`)[0];
    let cartCont = html.find(`#actor-inventory`)[0]
    let inputs = cartCont.querySelectorAll(`input.cart-item`);
    inputs.forEach(i=>{
      i.value = '0'});
    totalCont.innerText = '0';
  }

  OSRIS.customShop.haggle= function(mod = 0, actor, type){
    //prevent negative mod
    mod = mod != 0 && mod < 0 ? mod * -1 : mod
    let cha = actor.system.scores.cha.value;
    let chaMod = actordata.scores.cha.mod;
    let roll = (Math.floor(Math.random() * 20 + 1) - chaMod);
    let adjustedRoll = roll - mod;
    switch(roll){
      case roll == 20: 
      ui.notifications.warn('Critical Fail! - prices increased by 10%')
    }
  }
  OSRIS.customShop.renderCShopOnly = async function (actorName){
    let a = await game.actors.getName(actorName)
    if(!a){
      ui.notifications.warn('Actor not found!');
      return
    }
    OSRIS.customShop.renderCShop(a)
  }
};
