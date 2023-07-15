export const hideForeignPacks = () => {
  const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
  Hooks.on('changeSidebarTab', async  (tab) => {
    if(await game.settings.get(`osr-item-shop`, 'hideForeignPacks')){
      console.log()
      hfp(tab)
    }
  });
  Hooks.on('renderSidebarTab', async  (tab) => {
    await sleep(230)
    if(await game.settings.get(`osr-item-shop`, 'hideForeignPacks')){
      hfp(tab)
    }
  });
};

async function hfp(tab){
  if (tab._element[0].id === 'compendium') {
    const lis = document.querySelectorAll("li.compendium");
    const osrcbPacks = [...lis].filter(li=>{
      const send = li.dataset.entryId.includes('osr-item-shop');
      return send ? send : false;
    })
    if(osrcbPacks.length){
      const langstring = `-${game.i18n.lang}`
      osrcbPacks.forEach(async p=>{
        const pack = await game.packs.get(p.dataset.entryId);
        const name = pack.metadata.name
        const uniPack = name.includes('-all')
        if(uniPack) return;
        if(!name.includes(langstring) ){ 
          p.style.display = 'none'}
      })
    }
  }
}