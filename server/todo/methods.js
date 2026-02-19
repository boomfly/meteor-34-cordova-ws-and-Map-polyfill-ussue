import { Meteor } from 'meteor/meteor';
import { TodoMutations } from './mutations';
import { TodoQueries } from './queries';

Meteor.methods({
  'Todo.insert': function () {
    return TodoMutations.insert.apply(this, arguments);
  },
  'Todo.toggle': function () {
    return TodoMutations.toggle.apply(this, arguments);
  },
  'Todo.remove': function () {
    return TodoMutations.remove.apply(this, arguments);
  },
  'Todo.list': function () {
    return TodoQueries.list.apply(this, arguments);
  },
});
