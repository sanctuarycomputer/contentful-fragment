import Route from '@ember/routing/route';

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
        "_schemaRef": "32d705"
      },
      {
        "key": "Event Location",
        "value": "Sanctuary Computer Inc",
        "_schemaRef": "6a92b9"
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
        "_schemaRef": "32d705"
      },
      {
        "key": "Event Location",
        "value": "Human NYC",
        "_schemaRef": "6a92b9"
      }
    ]
  ]
}

const DummyExtension = {
  _isDummy: true,
  field: {
    _value: null,
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
  model() {
    if (DEV) {
      return DummyExtension;
    }
    return new Promise(window.contentfulFragment.getExtension);
  }
});
