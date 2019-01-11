import Component from '@ember/component';
import Muuri from 'muuri';
import { get } from '@ember/object';

export default Component.extend({
  classNames: ['muuri-grid-component'],
  didInsertElement() {
    this._super(...arguments);
    this.grid = new Muuri(this.element, {
      dragEnabled: true,
      dragSortInterval: 100,
      dragReleaseDuration: 300,
      dragReleaseEasing: 'ease',
      dragStartPredicate: {
        handle: '.cf-card-icon'
      }
    });
    this.grid.on('layoutEnd', (items) => {
      const newOrder = items.map(item => item.getElement().dataset.id);
      return get(this, 'updateSort')(newOrder);
    });
  },
  didUpdate() {
    const grid = get(this, 'grid');
    const prevItems = get(this, 'grid._items');
    const prevItemIds = prevItems.map(item => item._element.getAttribute('data-id'));

    const currentItemIds = [];
    const currentGridElements = document.getElementsByClassName('muuri-item-component');
    
    for (var i = 0; i < currentGridElements.length; i++) {
      const itemEl = currentGridElements[i];
      const uuid = itemEl.getAttribute('data-id');
      if (!prevItemIds.includes(uuid)) {
        grid.add(itemEl);
      }
      currentItemIds.push(uuid);
    }

    prevItems.forEach(item => {
      const itemEl = item._element
      if (!currentItemIds.includes(itemEl.getAttribute('data-id'))) {
        grid.remove(itemEl);
      }
    });

    grid.refreshItems();
  },
  willRemoveElement() {
    delete this.grid;
  }
});