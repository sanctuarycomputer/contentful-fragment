import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

const DEV = false;
const DUMMY_DATA = {
  "_schema": [
    {
      "key": "Event Name",
      "type": "Symbol",
      "uuid": "32d705"
    },
    {
      "key": "Event Location",
      "type": "Symbol",
      "uuid": "6a92b9"
    },
    {
      "key": "Event Date",
      "type": "Date",
      "uuid": "a592h9"
    }
  ],
  "fragments": [
    [
      {
        "key": "uuid",
        "value": "c36d6d"
      },
      {
        "key": "Event Name",
        "value": "Halloween Party",
        "type": "Symbol",
        "_schemaRef": "32d705"
      },
      {
        "key": "Event Location",
        "value": "Sanctuary Computer Inc",
        "type": "Symbol",
        "_schemaRef": "6a92b9"
      },
      {
        "key": "Event Date",
        "value": null,
        "type": "Date",
        "_schemaRef": "a592h9"
      }
    ],
    [
      {
        "key": "uuid",
        "value": "0e4b5a"
      },
      {
        "key": "Event Name",
        "value": "Rooftop Drinks",
        "type": "Symbol",
        "_schemaRef": "32d705"
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
      }
    ]
  ]
}

const DummyExtension = {
  _isDummy: true,
  field: {
    _value: DUMMY_DATA,
    getValue: function() {
      return { ...DummyExtension.field._value };
    },
    setValue: function(newValue) {
      DummyExtension.field._value = newValue;
      window.newValue = newValue;
      return new Promise(resolve => resolve(newValue));
    }
  }
};

export default Route.extend({
  extension: service(),

  model() {
    if (DEV) {
      return DummyExtension;
    }
    return new Promise(window.contentfulFragment.getExtension);
  },

  afterModel(contentfulExtension) {
    get(this, 'extension').setup(contentfulExtension);
  }
});
