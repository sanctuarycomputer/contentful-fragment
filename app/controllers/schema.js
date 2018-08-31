import Controller from '@ember/controller';
import { set } from '@ember/object';
import generateUUID from 'contentful-fragment/lib/generateUUID';

export default Controller.extend({
  actions: {
    addEmptySchemaField() {
      this.model.pushObject({ key: '', type: null, uuid: generateUUID() });
    },
    setFieldType(value) {
      const [uuid, type] = value.split('-');
      set(this.model.findBy('uuid', uuid), 'type', type);
    },
    cancel() {
      this.transitionToRoute('index');
    },
    save() {
      // TODO: ensure all fields are valid before saving
      const newValue = this.extension.field.getValue();
      set(newValue, '_schema', this.model);
      this.extension.field.setValue(newValue).then(() => {
        this.transitionToRoute('index');  
      });
    }
  }

});
