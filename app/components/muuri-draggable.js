import Component from '@ember/component';

export default Component.extend({
  classNames: ['muuri-draggable', 'grid'],
  
  didInsertElement() {
    new Muuri(this.element, {
      dragStartPredicate: {
        handle: '.cf-card-handle'
      }
    });
  }
});
