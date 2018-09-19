import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  extension: service(), 

  editingUUID: "",

  actions: {
    addFragment() {
      const newFragment = get(this, 'extension').addFragment();
      if (!newFragment) return;
      const uuid = get(newFragment.findBy('key', 'uuid'), 'value');
      set(this, 'editingUUID', uuid);
    },

    editFragment(uuid) {
      set(this, 'editingUUID', uuid);
    },

    cancelEditing() {
      set(this, 'editingUUID', "");
    },

    removeFragment(fragment) {
      get(this, 'extension').removeFragment(fragment);
      set(this, 'editingUUID', "");
    },

    save() {
      get(this, 'extension').persist();
    },

    saveDate(fragmentField, date) {
      if (date) {
        set(fragmentField, 'value', date.toISOString());
        get(this, 'extension').persist();
      }
    }
  }
});
