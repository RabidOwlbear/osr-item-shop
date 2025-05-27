const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
/**
 * ClassBuilderApp - A Foundry VTT application for creating and modifying OSR character classes
 * @extends {HandlebarsApplicationMixin(ApplicationV2)}
 */
export class OSRISApplication extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: 'osris-app',
    classes: ['osris-app', 'osris'],
    position: {
      width: 500,
      height: 600
    },
    tag: 'div',
    window: {
      title: 'OSR Item Shop',
      icon: 'fas fa-cart-shopping',
      resizable: false
    },
    // tabs: [
    //   {
    //     navSelector: '.tabs',
    //     contentSelector: '.tab-content',
    //     // initial: 'buy'
    //   }
    // ],
    dragDrop: [{ dragSelector: '[data-drag]', dropSelector: '.drop' }],
    // Enable automatic scroll position preservation
    preserveScrollPositions: true
  };
  
  constructor(options = {}) {
    super(options);
    this.dragDrop = this._createDragDropHandlers();
    this.isEditable = game.user.isGM;
  }
  /**
   * Render the party sheet
   * @param {Object} context - The context for the party sheet
   * @param {Object} options - The options for the party sheet
   * @static
   */
  _onRender(context, options) {
    this.dragDrop.forEach((d) => d.bind(this.element));
    this._forceTabInit(context.tabs);
  }

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  _createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      };
      return new foundry.applications.ux.DragDrop.implementation(d);
    });
  }

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    // game.user fetches the current user
    return this.isEditable;
  }

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const el = event.currentTarget;
    if ('link' in event.target.dataset || !game.user.isGM) return;
    // Extract the data you need
    let dragData = null;

    if (!dragData) return;

    // Set data transfer
    event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
  }

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}
  _onDrop(event) {
    const data = event.dataTransfer.getData('text/plain');
  }
  _getTabs(parts, tabs = ['main']) {
    const tabGroup = 'primary';
    const intialTab = this.options.tabs[0].initial;
    const tabData = {};
    // Default tab for first time it's rendered this session
    if (!this.tabGroups.primary) this.tabGroups.primary = intialTab;
    for (let part of parts) {
      const tab = {
        cssClass: '',
        group: tabGroup,
        // Matches tab property to
        id: '',
        // FontAwesome Icon, if you so choose
        icon: '',
        // Run through localization
        label: 'osr-helper-v2.partySheet.tab.'
      };
      //move to constructor
     
      switch (part) {
        case 'main':
          tab.id = 'main';
          tab.label += 'main';
          break;
      }
      // This is what turns on a single tab
      if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = 'active';
      if (tabs.includes(part)) {
        tabData[part] = tab;
      }
    }
    return tabData;
  }
  
  _forceTabInit(tabData) {
    const tabEls = [...this.element.querySelectorAll('.tab')];
    const tabInitialized = tabEls.filter((i) => i.classList.contains('active')).length > 0;
    if (!tabInitialized) {
      for (let property in tabData) { 
        if (tabData[property]?.cssClass === 'active') {
          const tabId = tabData[property].id;
          const tabEl = tabEls.find((i) => i.classList.contains(tabId));
          if (tabEl && !tabEl.classList.contains('active')) {
            tabEl.classList.add('active');
          }
        }
      }
    }
  }
}
