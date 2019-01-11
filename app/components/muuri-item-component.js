import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['muuri-item-component', 'mb1'],
  classNameBindings: ['isEditing:muuri-item-component--editing'],
  attributeBindings: ['uuid:data-id'],
  modelId: computed('uuid', function () {
    return this.get('uuid');
  })
});