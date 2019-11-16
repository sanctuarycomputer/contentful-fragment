import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import sanctuLogo from 'contentful-fragment/lib/sanctu';

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
          "data": sanctuLogo,
          "name": "default logo.jpg",
          "size": 1859,
          "type": "image/png"
        },
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
    const isDummy = ['localhost', 'contentful-fragment.io'].includes(window.location.hostname) || window.location.pathname === "/dummy";
    if (isDummy) {
      document.body.style.overflow = "auto";
      document.body.style.padding = "10px 10px 0px 10px";
    }
    if (isDummy) return DummyExtension;

    return new Promise(window.contentfulFragment.getExtension, DummyExtension);
  },

  afterModel(contentfulExtension) {
    get(this, 'extension').setup(contentfulExtension);
  }
});
