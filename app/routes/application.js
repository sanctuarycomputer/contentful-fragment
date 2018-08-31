import Route from '@ember/routing/route';

const DEV = false;

const DummyExtension = {
  _isDummy: true,
  field: {
    _value: {},
    getValue: function() {
      return { ...DummyExtension.field._value };
    },
    setValue: function(newValue) {
      DummyExtension.field._value = newValue;
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
