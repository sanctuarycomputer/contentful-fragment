import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

const DUMMY_DATA = {
  "_schema": [
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
  ],
  "fragments": [
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
        "value": new Date().setDate(new Date().getDate() + 1),
        "type": "Date",
        "_schemaRef": "a592h9"
      },
      {
        "key": "Logo",
        "value": {
          "data": "data:image/png;base64,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",
          "name": "default image.png",
          "size": 1859,
          "type": "image/png"
        },
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
  ]
};

const DUMMY_SCHEMA_SHORTHAND = null; //"Event Location:Symbol,Event Url: Symbol,Event Date:Date,Logo:Blob"

const DummyExtension = {
  parameters: {
    instance: {
      schemaShorthand: DUMMY_SCHEMA_SHORTHAND
    }
  },
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
    const isDummy = ['localhost', 'contentful-fragment.io'].includes(window.location.hostname);
    if (isDummy) return DummyExtension;

    return new Promise(window.contentfulFragment.getExtension, DummyExtension);
  },

  afterModel(contentfulExtension) {
    get(this, 'extension').setup(contentfulExtension);
  }
});
