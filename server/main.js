import { Meteor } from 'meteor/meteor';
import { TodosCollection } from '/imports/api/todos';
import './todo/methods';

Meteor.startup(async () => {
  if (await TodosCollection.find().countAsync() === 0) {
    await TodosCollection.insertAsync({
      text: 'Пример задачи: отметить как выполненную',
      completed: false,
      createdAt: new Date(),
    });
  }
});
