import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import generateUUID from 'contentful-fragment/lib/generateUUID';

const defaultValueForType = () => {
  // TODO
  return "";
};

const newFragmentFromSchema = schema => {
  return schema.reduce((acc, field) => {
    return [
      ...acc, 
      { key: field.key, value: defaultValueForType(field.type), type: field.type, _schemaRef: field.uuid }
    ];
  }, [{ key: 'uuid', value: generateUUID() }]);
};

export default Controller.extend({
  editingUUID: "",

  actions: {
    editFragment(uuid) {
      set(this, 'editingUUID', uuid);
    },
    cancelEditing() {
      set(this, 'editingUUID', "");
    },
    addFragment() {
      if (this.model._schema) {
        set(this, 'model.fragments', this.model.fragments || []);
        const newFragment = newFragmentFromSchema(this.model._schema);
        this.model.fragments.pushObject(newFragment);
        const uuid = get(newFragment.findBy('key', 'uuid'), 'value');
        set(this, 'editingUUID', uuid);
      }
    },
    removeFragment(fragment) {
      if (this.model.fragments) {
        const uuid = get(fragment.findBy('key', 'uuid'), 'value');
        const newFragments = this.model.fragments.reject(fragment => {
          return get(fragment.findBy('key', 'uuid'), 'value') === uuid;
        });
        set(this.model, 'fragments', newFragments);
      }
    },
    save(arg) {
      this.extension.field.setValue(this.model);
    },
    saveDate(fragmentField, date) {
      if (date) {
        set(fragmentField, 'value', date.toISOString());
        this.extension.field.setValue(this.model);
      }
    }
  }
});
