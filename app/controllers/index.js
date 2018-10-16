import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  extension: service(), 
  fileQueue: service(),

  editingUUID: "",
  showPreview: false,

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

    // Savers
    save() {
      get(this, 'extension').persist();
    },

    saveDate(fragmentField, date) {
      if (date) {
        set(fragmentField, 'value', date.toISOString());
        get(this, 'extension').persist();
      }
    },

    saveBlob(fragmentField, file) {
      if (!file) return;

      const { name, size, type } = file;
      return file.readAsDataURL().then(data => {
        set(fragmentField, 'value', {
          data, name, size, type
        });
        return get(this, 'extension').persist();
      }).finally(() => {
        const queue = get(this, 'fileQueue.queues').find(queue => get(queue, 'files').includes(file));
        if (queue) queue.remove(file);
      });
    }, 

    showPreview() {
      set(this, 'showPreview', true);
    },

    hidePreview() {
      set(this, 'showPreview', false);
    },

    updateSort(order) {
      get(this, 'extension').updateSort(order);
    }
  }
});
