import Controller from '@ember/controller';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({
  extension: service(),

  deletingUUID: "",

  actions: {
    stageFieldDeletion(field) {
      set(this, 'deletingUUID', field.uuid);
    },
    unstageFieldDeletion() {
      set(this, 'deletingUUID', "");
    },
    addEmptySchemaField() {
      get(this, 'extension').addSchemaField();
    },
    keyDidChange() {
      get(this, 'extension').validateSchema();
    },
    setFieldType(value) {
      const [uuid, type] = value.split('-');
      const field = get(this, 'extension.data._schema').findBy('uuid', uuid);
      set(field, 'type', type);
      get(this, 'extension').validateSchema();
    },
    cancel() {
      this.transitionToRoute('index');
    },
    save() {
      get(this, 'extension').persist().then(() => {
        get(this, 'extension').syncFragmentsToSchema();
        this.transitionToRoute('index');  
      });
    },
    removeFragmentField(field) {
      get(this, 'extension').removeSchemaField(field);
    }
  }

});
