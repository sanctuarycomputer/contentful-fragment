import Component from '@ember/component';
import { get, set } from '@ember/object';

function generateUUID() {
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
}

const newFragmentFromSchema = schema => {
  return Object.keys(schema).reduce((acc, key) => {
    return [
      ...acc, 
      { key, value: '' }
    ];
  }, [{ key: 'uuid', value: generateUUID() }]);
};

export default Component.extend({
  actions: {
    addFragment() {
      const data = get(this, 'data');
      data.fragments.pushObject(newFragmentFromSchema(data._schema));
    },
    removeFragment(fragment) {
      const uuid = get(fragment.findBy('key', 'uuid'), 'value');
      const newFragments = get(this, 'data.fragments').reject(fragment => {
        return get(fragment.findBy('key', 'uuid'), 'value') === uuid;
      });
      set(this, 'data.fragments', newFragments);
    }
  }
});
