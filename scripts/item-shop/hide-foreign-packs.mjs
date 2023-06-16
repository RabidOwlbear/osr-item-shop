export const hideForeignPacks = () => {
  Hooks.on('changeSidebarTab', async  (tab) => {
    if(await game.settings.get(`osr-item-shop`, 'hideForeignPacks')){
      if (tab._element[0].id === 'compendium') {
        const langList = ['en', 'es'];
        const curLang = game.i18n.lang;
        const hideList = langList.filter((i) => i != curLang);
        console.log(hideList);
        const packs = tab._element[0].getElementsByClassName('compendium-name');
  
        const osrhPacks = [];
        for (let pack of packs) {
          console.log(pack.innerText)
          const osrPack = pack.innerText.indexOf('osr-items');
          if (osrPack != -1) {
            osrhPacks.push(pack);
          }
        }
        for (let lang of hideList) {
          for (let pack of osrhPacks) {
            console.log(pack.innerText, pack.innerText.indexOf('osr-items'));
            let indexLang = pack.innerText.indexOf(`(${lang})`);
            if (indexLang !== -1) {
              //change to equal
              console.log('hide', pack.innerText);
              pack.parentElement.style.display = 'none';
            }
          }
        }
      }
    }

  });
};