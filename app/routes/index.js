import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return this.modelFor('application').field.getValue();
  }
});
