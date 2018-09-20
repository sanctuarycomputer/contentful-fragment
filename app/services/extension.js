import Service from '@ember/service';
import { get, set } from '@ember/object';

const emptyForType = (/*type*/) => {
  // TODO
  return null;
};

const coerce = (type, value) => {
  if (!value) return emptyForType(type);
  return value;
};

const generateUUID = () => {
  let d = new Date().getTime();
  if (window.performance && typeof window.performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  const uuid = 'xxxxxx'.replace(/[xy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
  });
  return uuid;
};

const validateSchemaField = field => {
  let validation = '';
  if (!field.key || field.key.length === 0) validation += 'Enter a key for this field';
  if (!field.type) {
    if (validation.length) validation += ', ';
    validation += 'Select a field type';
  }
  return validation;
};

const newFragmentFromSchema = schema => {
  return schema.reduce((acc, field) => {
    return [
      ...acc, 
      { 
        key: field.key, 
        value: emptyForType(field.type), 
        type: field.type, 
        _schemaRef: field.uuid 
      }
    ];
  }, [{ 
    key: 'uuid', 
    value: generateUUID()
  }]);
};

export default Service.extend({
  data: null,
  extension: null,

  setup(extension) {
    set(this, 'data', extension.field.getValue() || {});
    console.log(
      extension.parameters.instance.schemaShorthand, 'shorthand'
    );
    set(this, 'extension', extension);
  },

  /* Main Editor */
  addFragment() {
    if (get(this, 'data._schema')) {
      set(this, 'data.fragments', get(this, 'data.fragments') || []);
      const newFragment = newFragmentFromSchema(get(this, 'data._schema'));
      get(this, 'data.fragments').pushObject(newFragment);
      return newFragment;
    }
  },

  removeFragment(fragment) {
    if (get(this, 'data.fragments')) {
      const uuid = get(fragment.findBy('key', 'uuid'), 'value');
      const newFragments = this.data.fragments.reject(fragment => {
        return get(fragment.findBy('key', 'uuid'), 'value') === uuid;
      });
      set(this, 'data.fragments', newFragments);
    }
  },

  /* Schema Editor */
  validateSchema() {
    get(this, 'data._schema').forEach(schemaField => {
      set(schemaField, 'validation', validateSchemaField(schemaField));
    });
  },

  syncFragmentsToSchema() {
    const { fragments, _schema } = get(this, 'data');

    const syncedFragments = (fragments || []).map(fragment => {
      const syncedFragment = _schema.map(schemaField => {
        const dataForSchemaField = fragment.findBy('_schemaRef', schemaField.uuid);
        return {
          key: schemaField.key,
          type: schemaField.type,
          value: coerce(schemaField.type, dataForSchemaField ? dataForSchemaField.value : null),
          _schemaRef: schemaField.uuid,
        };
      });
      return [fragment.findBy('key', 'uuid'), ...syncedFragment];
    });

    set(this, 'data.fragments', syncedFragments);
  },

  addSchemaField() {
    const newField = { key: '', type: null, uuid: generateUUID(), validation: '' };
    set(newField, 'validation', validateSchemaField(newField));
    get(this, 'data._schema').pushObject(newField);
    return newField;
  },

  removeSchemaField(field) {
    const newFields = get(this, 'data._schema').reject(existingField => {
      return existingField.uuid === field.uuid;
    });
    set(this, 'data._schema', newFields);
  },

  persist() {
    // TODO: ensure all fields are valid before saving
    return this.extension.field.setValue(this.model);
  },
});
