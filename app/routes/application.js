import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    return {
      fragments: [
        [{
          key: 'uuid',
          value: '123aabc'
        }, {
          key: 'name',
          value: 'Rubber Tires'
        }]
      ],
      _schema: {
        name: 'Symbol' // Symbol, Text, Integer, Number, Date, Location, Boolean
      }
    };
  }
});
