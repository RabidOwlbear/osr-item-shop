export const socket = {
  registerSocket: function () {
    game.socket.on('module.osr-item-shop', OSRIS.socket.HandleSocket);
  },
  HandleSocket: async function (socketData, id) {
    
    const data = socketData.data
    const type = socketData.type
    console.log('GMsocket')
    let singleGM = game.users.filter((u) => u.isGM)[0];
    
    console.log(socketData)
    switch (type){
      case 'setting':
        if (game.user.id != singleGM.id) return;
        if(data.type == 'set'){
          OSRIS.socket.setting(data.type, data);
        }
        if(data.type == 'get'){
          OSRIS.socket.setting(data.type, data);
        }
        break
      case 'shopTransaction':
        if (game.user.id != singleGM.id) return;
        OSRIS.socket.shopTransaction(data);
        break
      case 'actorFlag':
        if (game.user.id != singleGM.id) return;
        OSRIS.socket.GMActorFlag(data);
        break
      case 'transactionComplete':
        OSRIS.socket.transactionComplete(data)
    }
  },
  transactionComplete: async function(data){
    ui.notifications.notify('Transaction Complete.')
    if(game.user.id == data.userId){
      ui.windows[data.appId].render()
    }
  },
  shopTransaction: async (data)=>{
    const shop = await game.actors.get(data.shop._id)
    const customer = await game.actors.get(data.customer._id)
    let shopGP = shop.items.getName('GP')
    let customerGP = customer.items.getName('GP')
    let {items, total, newGP} = data;
    switch(data.type){
      case 'buy':
        
        for(let item of items){
          let itemObj = await shop.items.get(item.id);
          await customer.createEmbeddedDocuments('Item', [itemObj]);
          // let shopItem = shop.items.get(item.id)
          await itemObj.delete()
        }
        await customerGP.update({system:{quantity:{value: newGP.customer}}})
        await shopGP.update({system:{quantity:{value: newGP.shop}}})
        break
      case 'sell':
        for(let item of items){
          let itemObj = await customer.items.get(item.id);
          await shop.createEmbeddedDocuments('Item', [itemObj]);         
          await itemObj.delete()
        }
        await customerGP.update({system:{quantity:{value: newGP.customer}}})
        await shopGP.update({system:{quantity:{value: newGP.shop}}})
        break
        
    }
    game.socket.emit('module.osr-item-shop', {type: 'transactionComplete', data: {
      userId: data.userId, 
      appId: data.shopApp
      }
    })
  },

  GMActorFlag: async (data)=>{
    console.log('wtf', data);
    let {flag, flagData, actorId, type} = data;
    const actor = await game.actors.get(actorId);
    if(type == 'set'){
      actor.setFlag('osr-item-shop', flag, flagData);
    }
    if(type == 'unset'){
      actor.unsetFlag('osr-item-shop', flag);
    }
    return true
  },
  settting: (data)=>{
    let singleGM = game.users.filter((u) => u.isGM)[0];
    if (game.user.id != singleGM.id) return;
    switch (data.type){
      case 'set':
        game.settings.set('osr-item-shop', data.setting, data.value);
        return true
      case 'get':
        return game.settings.get('osr-item-shop', data.setting);
    }
  }

}

