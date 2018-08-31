import Controller from '@ember/controller';
import { set } from '@ember/object';
import generateUUID from 'contentful-fragment/lib/generateUUID';

const validateField = field => {
  let validation = '';
  if (!field.key || field.key.length === 0) validation += 'Enter a key for this field';
  if (!field.type) {
    if (validation.length) validation += ', ';
    validation += 'Select a field type';
  }
  return validation;
};

export default Controller.extend({
  deletingUUID: "",
  actions: {
    stageFieldDeletion(field) {
      set(this, 'deletingUUID', field.uuid);
    },
    unstageFieldDeletion() {
      set(this, 'deletingUUID', "");
    },
    addEmptySchemaField() {
      const field = { key: '', type: null, uuid: generateUUID(), validation: '' };
      set(field, 'validation', validateField(field));
      this.model.pushObject(field);
    },
    keyDidChange(field) {
      set(field, 'validation', validateField(field));
    },
    setFieldType(value) {
      const [uuid, type] = value.split('-');
      const field = this.model.findBy('uuid', uuid);
      set(field, 'type', type);
      set(field, 'validation', validateField(field));
    },
    cancel() {
      this.transitionToRoute('index');
    },
    save() {
      // TODO: ensure all fields are valid before saving
      const newValue = this.extension.field.getValue() || {};
      newValue._schema = this.model;
      this.extension.field.setValue(newValue).then(() => {
        this.transitionToRoute('index');  
      });
    },
    removeFragmentField(field) {
      const newFields = this.model.reject(existingField => {
        return existingField.uuid === field.uuid;
      });
      set(this, 'model', newFields);
    }
  }

});
