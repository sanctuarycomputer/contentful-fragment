import Route from '@ember/routing/route';

const emptyForType = (type) => {
  return null;
};

const coerce = (type, value) => {
  if (!value) return emptyForType(type);
  return value;
};

const ensureFragmentsAreSyncedToSchema = ({ fragments, _schema }) => {
  const validatedFragments = (fragments || []).map(fragment => {
    const validatedFragment = _schema.map(schemaField => {
      const dataForSchemaField = fragment.findBy('_schemaRef', schemaField.uuid);
      return {
        key: schemaField.key,
        type: schemaField.type,
        value: coerce(schemaField.type, dataForSchemaField ? dataForSchemaField.value : null),
        _schemaRef: schemaField.uuid,
      };
    });
    return [fragment.findBy('key', 'uuid'), ...validatedFragment];
  });
  return { fragments: validatedFragments, _schema };
};

export default Route.extend({
  model() {
    const data = this.modelFor('application').field.getValue() || {};
    return ensureFragmentsAreSyncedToSchema(data);
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('extension', this.modelFor('application'));
  }
});
