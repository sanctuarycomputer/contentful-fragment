import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

/* 
 * This represents the schema shorthand a developer would enter
 * when setting up the content type under Appearance > Predefined Schema
 */
const SCHEMA_SHORTHAND = "Event Location:Symbol,Event Url: Symbol,Event Date:Date,Logo:Blob";
/* 
 * This represents a schema a user can edit on the front end
 * by clicking "Setup Fragment"
 */
const _SCHEMA = [
  {
    "key": "Event Location",
    "type": "Symbol",
    "uuid": "6a92b9"
  },
  {
    "key": "Event Url",
    "type": "Symbol",
    "uuid": "6a27d9"
  },
  {
    "key": "Event Date",
    "type": "Date",
    "uuid": "a592h9"
  },
  {
    "key": "Logo",
    "type": "Blob",
    "uuid": "a592f3"
  }
];
const FRAGMENT_DATA = [
  [
    {
      "key": "uuid",
      "value": "c36d6d"
    },
    {
      "key": "Event Location",
      "value": "Sanctuary Computer Inc",
      "type": "Symbol",
      "_schemaRef": "6a92b9"
    },
    {
      "key": "Event Url",
      "value": "https://www.google.com/maps/place/Sanctuary+Computer/@40.71811,-73.997507,17z/data=!3m1!4b1!4m5!3m4!1s0x89c259880e5637e3:0xcdc06390643521f5!8m2!3d40.71811!4d-73.995313",
      "type": "Symbol",
      "_schemaRef": "6a27d9"
    },
    {
      "key": "Event Date",
      "value": null,
      "type": "Date",
      "_schemaRef": "a592h9"
    },
    {
      "key": "Logo",
      "value": null,
      "type": "Blob",
      "_schemaRef": "a592f3"
    }
  ],
  [
    {
      "key": "uuid",
      "value": "0e4b5a"
    },
    {
      "key": "Event Location",
      "value": "Human NYC",
      "type": "Symbol",
      "_schemaRef": "6a92b9"
    },
    {
      "key": "Event Date",
      "value": null,
      "type": "Date",
      "_schemaRef": "a592h9"
    },
    {
      "key": "Logo",
      "value": null,
      "type": "Blob",
      "_schemaRef": "a592f3"
    }
  ]
];

const PARSED_FRAGMENT = [
  { "key": "uuid", "value": "c36d6d" },
  { "_schemaRef": "6a92b9", "key": "Event Location", "type": "Symbol", "value": "Sanctuary Computer Inc" },
  { "_schemaRef": "6a27d9", "key": "Event Url", "type": "Symbol", "value": "https://www.google.com/maps/place/Sanctuary+Computer/@40.71811,-73.997507,17z/data=!3m1!4b1!4m5!3m4!1s0x89c259880e5637e3:0xcdc06390643521f5!8m2!3d40.71811!4d-73.995313" },
  { "_schemaRef": "a592h9", "key": "Event Date", "type": "Date", "value": null },
  { "_schemaRef": "a592f3", "key": "Logo", "type": "Blob", "value": null }
];

filterSc
const filterSchemaRef = fragment => {
  // eslint-disable-next-line no-unused-vars
  return fragment.reduce((memo, { _schemaRef, ...field }) => {
    return memo.concat(field);
  }, []);
};


const mockExtension = (fragments, _schema, schemaShorthand) => {
  const DummyExtension = {
    _isDummy: true,
    parameters: {
      instance: { schemaShorthand }
    },
    field: {
      _value: {
        "_schema": _schema,
        "fragments": fragments
      },
      getValue: function () {
        return { ...DummyExtension.field._value };
      },
      setValue: function (newValue) {
        DummyExtension.field._value = newValue;
        window.newValue = newValue;
        return new Promise(resolve => resolve(newValue));
      }
    }
  };
  return DummyExtension;
};



module('Unit | Service | extension', function(hooks) {
  setupTest(hooks);
  let service;

  test('it exists', function(assert) {
    let service = this.owner.lookup('service:extension');
    assert.ok(service);
  });

  // Initial Setup
  test('initial setup - blank fragment, no schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension());

    assert.equal(service.data._settings, undefined);
    assert.equal(service.data._schema, undefined);
  });

  test('initial setup - blank fragment, free schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(null, _SCHEMA));

    assert.equal(service.data._settings, undefined);
    assert.deepEqual(service.data._schema, _SCHEMA);
  });

  test('initial setup - blank fragment, predefined schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(null, null, SCHEMA_SHORTHAND));

    assert.equal(service.data._settings.usesPredefinedSchema, true);
    // confirming data shape this way bc uuids will be random
    assert.equal(service.data._schema.length, SCHEMA_SHORTHAND.split(',').length);
    assert.deepEqual(service.data._schema.map(field => field.key), [
      'Event Location',
      'Event Url',
      'Event Date',
      'Logo'
    ]);
    assert.deepEqual(service.data._schema.map(field => field.type), [
      'Symbol',
      'Symbol',
      'Date',
      'Blob'
    ]);
  });

  test('initial setup - saved fragment, free schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(FRAGMENT_DATA, _SCHEMA));
    
    assert.equal(service.data._settings, undefined);
    assert.deepEqual(service.data._schema, _SCHEMA);
    assert.deepEqual(
      service.data.fragments[0],
      PARSED_FRAGMENT
    );
  });

  test('initial setup - saved fragment, predefined schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(FRAGMENT_DATA, _SCHEMA, SCHEMA_SHORTHAND));

    assert.equal(service.data._settings.usesPredefinedSchema, true);
    assert.equal(service.data._schema.length, SCHEMA_SHORTHAND.split(',').length);
    assert.deepEqual(service.data._schema.map(field => field.key), [
      'Event Location',
      'Event Url',
      'Event Date',
      'Logo'
    ]);
    assert.deepEqual(service.data._schema.map(field => field.type), [
      'Symbol',
      'Symbol',
      'Date',
      'Blob'
    ]);
    assert.deepEqual(
      filterSchemaRef(service.data.fragments[0]),
      filterSchemaRef(PARSED_FRAGMENT)
    );
  });

  test('setSetting()', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );
    service.setSetting('foo', 'bar');

    assert.equal(service.data._settings.foo, 'bar');
  });

  test('Add a new field to the schema - blank fragment, no schema', function(assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension());
    service.addSchemaField();

    const schema = service.data._schema;
    assert.equal(schema[schema.length - 1].key, '');
    assert.equal(schema[schema.length - 1].type, null);
    assert.equal(typeof schema[schema.length - 1].uuid, 'string');
    assert.equal(schema[schema.length - 1].validation, 'Enter a key for this field, Select a field type');
  });

  test('Add a new field to the schema - blank fragment, predefined schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(null, null, SCHEMA_SHORTHAND));
    service.addSchemaField();

    const schema = service.data._schema;
    assert.equal(schema[schema.length - 1].key, '');
    assert.equal(schema[schema.length - 1].type, null);
    assert.equal(typeof schema[schema.length - 1].uuid, 'string');
    assert.equal(schema[schema.length - 1].validation, 'Enter a key for this field, Select a field type');
  });

  test('Add a new field to the schema - saved fragment, free schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(FRAGMENT_DATA, _SCHEMA));
    service.addSchemaField();

    const schema = service.data._schema;
    assert.equal(schema[schema.length - 1].key, '');
    assert.equal(schema[schema.length - 1].type, null);
    assert.equal(typeof schema[schema.length - 1].uuid, 'string');
    assert.equal(schema[schema.length - 1].validation, 'Enter a key for this field, Select a field type');
  });

  test('Add a new field to the schema - saved fragment, predefined schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(mockExtension(FRAGMENT_DATA, null, SCHEMA_SHORTHAND));
    service.addSchemaField();

    const schema = service.data._schema;
    assert.equal(schema[schema.length - 1].key, '');
    assert.equal(schema[schema.length - 1].type, null);
    assert.equal(typeof schema[schema.length - 1].uuid, 'string');
    assert.equal(schema[schema.length - 1].validation, 'Enter a key for this field, Select a field type');
  });

  test('Remove a field from the schema', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );

    assert.deepEqual(
      service.data._schema.find(schemaField => schemaField.key === 'Event Url'),
      _SCHEMA[1]
    );

    service.removeSchemaField(_SCHEMA[1]);
    assert.deepEqual(
      service.data._schema.find(schemaField => schemaField.key === 'Event Url'),
      undefined
    );
  });

  test('Add fragment', function (assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );
    service.addFragment();

    const fragments = service.data.fragments;
    const newFragment = fragments[fragments.length - 1];
    assert.equal(
      newFragment.find(field => field.key === 'uuid').value.length,
      6
    );
    assert.equal(
      newFragment.find(field => field.key === 'Event Location').type,
      'Symbol'
    );
    assert.equal(
      newFragment.find(field => field.key === 'Event Location').value,
      null
    );
    assert.equal(
      newFragment.find(field => field.key === 'Logo').type,
      'Blob'
    );
    assert.equal(
      newFragment.find(field => field.key === 'Logo').value,
      null
    );
  });

  test('Remove fragment', function(assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );

    assert.deepEqual(
      service.data.fragments.length,
      2
    );

    service.removeFragment(PARSED_FRAGMENT);
    assert.deepEqual(
      service.data.fragments.length,
      1
    );
  });

  test('Generate Simple Fragments', function(assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );

    assert.deepEqual(
      service.data.simpleFragments,
      {
        "0e4b5a": {
          "eventDate": null,
          "eventLocation": "Human NYC",
          "eventUrl": null,
          "index": 1,
          "logo": null,
          "uuid": "0e4b5a"
        },
        "c36d6d": {
          "eventDate": null,
          "eventLocation": "Sanctuary Computer Inc",
          "eventUrl": "https://www.google.com/maps/place/Sanctuary+Computer/@40.71811,-73.997507,17z/data=!3m1!4b1!4m5!3m4!1s0x89c259880e5637e3:0xcdc06390643521f5!8m2!3d40.71811!4d-73.995313",
          "index": 0,
          "logo": null,
          "uuid": "c36d6d"
        }
      }
    )
  });

  test('JSON Preview', function(assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );

    service.generateJSONPreview();
    assert.deepEqual(
      JSON.parse(service.preview),
      service.data
    );
    
  });
  
  test('Persist data', function(assert) {
    service = this.owner.lookup('service:extension');
    service.setup(
      mockExtension(FRAGMENT_DATA, _SCHEMA)
    );
    assert.ok(service.persist());
  });

});

