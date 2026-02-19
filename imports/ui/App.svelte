<script>
  import { Meteor } from "meteor/meteor";
  import { onMount } from "svelte";

  let items = $state([]);
  let loading = $state(false);
  let errorMessage = $state("");
  let newItemText = $state("");

  const fetchItems = async () => {
    loading = items.length === 0;
    errorMessage = "";

    try {
      const result = await Meteor.callAsync("Todo.list");
      items = result || [];
    } catch (error) {
      errorMessage = error?.reason || "Не удалось загрузить список.";
      items = items.length ? items : [];
    } finally {
      loading = false;
    }
  };

  const addItem = async () => {
    if (!newItemText.trim()) {
      errorMessage = "Введите текст задачи.";
      return;
    }

    try {
      await Meteor.callAsync("Todo.insert", newItemText);
      newItemText = "";
      fetchItems();
    } catch (error) {
      errorMessage = error?.reason || "Не удалось добавить задачу.";
    }
  };

  const toggleItem = async (itemId) => {
    try {
      await Meteor.callAsync("Todo.toggle", itemId);
      fetchItems();
    } catch (error) {
      errorMessage = error?.reason || "Не удалось обновить задачу.";
    }
  };

  const removeItem = async (itemId) => {
    try {
      await Meteor.callAsync("Todo.remove", itemId);
      fetchItems();
    } catch (error) {
      errorMessage = error?.reason || "Не удалось удалить задачу.";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    addItem();
  };

  onMount(() => {
    fetchItems();
  });
</script>

<div class="min-h-screen bg-slate-100 px-4 py-10 text-slate-900">
  <div class="mx-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
    <h1 class="mb-6 text-2xl font-semibold">Todo List</h1>
    <form class="mb-4 flex gap-3" onsubmit={handleSubmit}>
      <input
        class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
        type="text"
        placeholder="Добавить новую задачу"
        bind:value={newItemText}
        aria-label="Добавить задачу"
      />
      <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500" type="submit">
        Добавить
      </button>
    </form>

    {#if errorMessage}
      <div class="mb-3 rounded-xl bg-red-100 px-3 py-2 text-sm text-red-700">{errorMessage}</div>
    {/if}

    {#if loading}
      <div class="text-sm text-slate-500 flex items-center justify-center">Загрузка...</div>
    {:else if items.length === 0}
      <div class="text-sm text-slate-500">Список пуст. Добавьте первую задачу.</div>
    {:else}
      <ul class="space-y-3">
        {#each items as item (item._id)}
          <li class={`flex items-center gap-3 rounded-xl border px-3 py-3 ${item.completed ? 'border-sky-200 bg-sky-50' : 'border-slate-200 bg-slate-50'}`}>
            <button
              class="flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-white text-base"
              type="button"
              onclick={() => toggleItem(item._id)}
              aria-pressed={item.completed}
              aria-label="Отметить задачу"
            >
              {item.completed ? "✓" : "○"}
            </button>
            <span class={`flex-1 text-sm ${item.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
              {item.text}
            </span>
            <button
              class="text-sm text-red-500 hover:text-red-600"
              type="button"
              onclick={() => removeItem(item._id)}
              aria-label="Удалить задачу"
            >
              Удалить
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
