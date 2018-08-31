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
        "value": "Halloween Party"
      },
      {
        "key": "Event Location",
        "value": "Sanctuary Computer Inc"
      }
    ],
    [
      {
        "key": "uuid",
        "value": "0e4b5a"
      },
      {
        "key": "Event Name",
        "value": "Rooftop Drinks"
      },
      {
        "key": "Event Location",
        "value": "Human NYC"
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
  model() {
    if (DEV) {
      return DummyExtension;
    }
    return new Promise(window.contentfulFragment.getExtension);
  }
});
