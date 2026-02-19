import { test, expect } from '@playwright/test';

test.describe('todo app', () => {
  test('adds a todo', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Добавить задачу').fill('Buy milk');
    await page.getByRole('button', { name: 'Добавить' }).click();

    await expect(page.getByText('Buy milk')).toBeVisible();
  });

  test('toggles a todo', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Добавить задачу').fill('Walk the dog');
    await page.getByRole('button', { name: 'Добавить' }).click();

    const todoItem = page.getByText('Walk the dog');
    const toggleButton = todoItem.locator('..').getByRole('button', { name: 'Отметить задачу' });

    await toggleButton.click();
    await expect(todoItem).toHaveClass(/line-through/);
  });

  test('removes a todo', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Добавить задачу').fill('Read a book');
    await page.getByRole('button', { name: 'Добавить' }).click();

    const todoRow = page.getByText('Read a book').locator('..');
    await todoRow.getByRole('button', { name: 'Удалить задачу' }).click();

    await expect(page.getByText('Read a book')).toHaveCount(0);
  });
});
