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
      },
      {
        "key": "Logo",
        "value": null,
        "type": "Blob",
        "_schemaRef": "a592f3"
      }
    ]
  ]
}

const DummyExtension = {
  parameters: {
    instance: {
      schemaShorthand: "Event Location:Symbol,Event Url: Symbol,Event Date:Date,Logo:Blob"
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
    if (DEV) {
      return DummyExtension;
    }
    return new Promise(window.contentfulFragment.getExtension);
  },

  afterModel(contentfulExtension) {
    get(this, 'extension').setup(contentfulExtension);
  }
});
