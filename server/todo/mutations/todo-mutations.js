import { Meteor } from 'meteor/meteor';
import { TodosCollection } from '/imports/api/todos';

export async function insert(text) {
  if (!text || typeof text !== 'string') {
    throw new Meteor.Error('todos.insert.invalid', 'Todo text is required.');
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Meteor.Error('todos.insert.empty', 'Todo text cannot be empty.');
  }

  await TodosCollection.insertAsync({
    text: trimmedText,
    completed: false,
    createdAt: new Date(),
  });
}

export async function toggle(todoId) {
  if (!todoId || typeof todoId !== 'string') {
    throw new Meteor.Error('todos.toggle.invalid', 'Todo id is required.');
  }

  const todo = await TodosCollection.findOneAsync({ _id: todoId });
  if (!todo) {
    throw new Meteor.Error('todos.toggle.notFound', 'Todo not found.');
  }

  await TodosCollection.updateAsync(todoId, { $set: { completed: !todo.completed } });
}

export async function remove(todoId) {
  if (!todoId || typeof todoId !== 'string') {
    throw new Meteor.Error('todos.remove.invalid', 'Todo id is required.');
  }

  await TodosCollection.removeAsync(todoId);
}
