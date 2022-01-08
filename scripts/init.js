Hooks.on('init', () => {
  game.settings.register('osr-item-shop', 'charBuilderCheck', {
    name: 'Add open shop checkbox to OSE character builder (if installed)',
    hint: 'Adds option to open item shop following character creation using the OSE character builder included  with the Old-School-Essentials module.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true
  });
});

// 