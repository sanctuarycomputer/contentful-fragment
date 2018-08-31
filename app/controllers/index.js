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
      { key: field.key, value: defaultValueForType(field.type) }
    ];
  }, [{ key: 'uuid', value: generateUUID() }]);
};

export default Controller.extend({
  actions: {
    addFragment() {
      if (this.model._schema) {
        set(this, 'model.fragments', this.model.fragments || []);
        this.model.fragments.pushObject(newFragmentFromSchema(this.model._schema));
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
    }
  }
});
