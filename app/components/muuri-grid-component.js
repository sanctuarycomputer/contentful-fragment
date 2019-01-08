import Component from '@ember/component';
import Muuri from 'muuri';

export default Component.extend({
  classNames: ['muuri-grid-component'],

  didInsertElement() {
    this.grid = new Muuri(this.element, {
      dragEnabled: true,
      dragSortInterval: 100,
      dragStartPredicate: {
        handle: '.cf-card-icon'
      }
    });
    this.grid.on('layoutEnd', (items) => {
      const newOrder = items.map(item => item.getElement().dataset.id);
      return this.get('updateSort')(newOrder);
    });
  },

  willRemoveElement() {
    delete this.grid;
  }
});