import { TodosCollection } from '/imports/api/todos';

export async function list() {
  return TodosCollection.find({}, { sort: { createdAt: -1 } }).fetchAsync();
}
