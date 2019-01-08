import Service from '@ember/service';
import { get, set } from '@ember/object';

const TYPES = [
  'Symbol',
  'Date',
  'Blob'
];

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
  preview: null,

  setup(extension) {
    set(this, 'data', extension.field.getValue() || {});
    set(this, 'extension', extension);
    this.loadSchemaFromShorthand();
    this.syncFragmentsToSchema();
    this.makeSimpleFragments();
  },

  setSetting(key, value) {
    set(this, 'data._settings', get(this, 'data._settings') || {});
    set(this, `data._settings.${key}`, value);
  },

  loadSchemaFromShorthand() {
    const shorthand = (get(this, 'extension.parameters.instance.schemaShorthand') || "");
    if (!shorthand.length) return;

    const parsedSchemaFields = 
      shorthand.split(",").map(tuple => tuple.split(":").map(t => t.trim()));
    const existingSchema = get(this, 'data._schema') || [];

    const loadedSchema = parsedSchemaFields.reduce((acc, fieldTuple) => {
      const [key, type] = fieldTuple;
      if (key.length === 0) {
        // eslint-disable-next-line
        console.warn(
          `Contentful Fragment: Your Predefined Schema included a blank schema key! Please refer to the documentation.`
        );
        return acc;
      }
      if (!TYPES.includes(type)) {
        // eslint-disable-next-line
        console.warn(
          `Contentful Fragment: Your Predefined Schema included unknown type: ${type}. Must be one of <${TYPES.join(' ')}>`
        ); 
        return acc;
      }
      const match = existingSchema.findBy('key', fieldTuple[0]);
      return [...acc, {
        uuid: (match ? match.uuid : generateUUID()), key, type
      }];
    }, []).filter(schemaField => {
      return parsedSchemaFields.find(schemaTuple => schemaTuple[0] === schemaField.key);
    });

    this.setSetting('usesPredefinedSchema', true);
    set(this, 'data._schema', loadedSchema);
  },

  /* Main Editor */
  addFragment() {
    if (get(this, 'data._schema')) {
      set(this, 'data.fragments', get(this, 'data.fragments') || []);
      const newFragment = newFragmentFromSchema(get(this, 'data._schema'));
      get(this, 'data.fragments').pushObject(newFragment);
      this.persist();
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
      this.persist();
    }
  },

  /* Schema Editor */
  validateSchema() {
    get(this, 'data._schema').forEach(schemaField => {
      set(schemaField, 'validation', validateSchemaField(schemaField));
    });
  },

  syncFragmentsToSchema() {
    const { fragments, _schema = [] } = get(this, 'data');
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
    this.persist();
  },

  addSchemaField() {
    const newField = { key: '', type: null, uuid: generateUUID(), validation: '' };
    set(newField, 'validation', validateSchemaField(newField));
    if (get(this, 'data._schema')) {
      get(this, 'data._schema').pushObject(newField);
    } else {
      set(this, 'data._schema', [newField]);
    }
    
    return newField;
  },

  removeSchemaField(field) {
    const newFields = get(this, 'data._schema').reject(existingField => {
      return existingField.uuid === field.uuid;
    });
    set(this, 'data._schema', newFields);
  },

  makeSimpleFragments() {
    const simpleFragments = (get(this, 'data.fragments') || []).reduce((simpleFragments, fragment, index) => {
      const uuid = get(fragment.findBy('key', 'uuid'), 'value');

      simpleFragments[uuid] = fragment.reduce((simpleFragment, fragmentField) => {
        if (fragmentField.key === "uuid") return simpleFragment;
        if (fragmentField.key) {
          simpleFragment[fragmentField.key.camelize()] = fragmentField.value;
        }
        
        return {
          index,
          uuid,
          ...simpleFragment
        };
      }, {});

      return simpleFragments;
    }, {});

    set(this, 'data.simpleFragments', simpleFragments);
  },

  generateJSONPreview() {
    try {
      const jsonPreview = JSON.stringify(this.data, null, 2);
      set(this, 'preview', jsonPreview);
    } catch (e) {
      set(this, 'preview', 'Could not generate preview');
    }
  },

  updateSort(order) {
    const fragments = get(this, 'data.fragments');
    const resorted = order.map(uuid => fragments.find(fragment => {
      const fragmentUuid = get(fragment.findBy('key', 'uuid'), 'value');
      return uuid === fragmentUuid
    }));

    set(this, 'data.fragments', resorted);
    this.persist();
  },

  persist() {
    this.makeSimpleFragments();
    this.generateJSONPreview();
    return this.extension.field.setValue(get(this, 'data'));
  },
});
