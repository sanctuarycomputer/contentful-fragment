import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootRouterURL
});

Router.map(function() {
  this.route('schema');
});

export default Router;
