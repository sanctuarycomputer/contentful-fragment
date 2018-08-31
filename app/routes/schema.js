import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return ((this.modelFor('application').field.getValue() || {})._schema || []);
  },
  setupController(controller) {
    this._super(...arguments);
    controller.set('extension', this.modelFor('application'));
  }
});
