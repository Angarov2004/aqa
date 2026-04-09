import { test, expect } from '@playwright/test';

test('API - get products', async ({ request }) => {
  const response = await request.get('http://localhost:5000/api/products');

  expect(response.status()).toBe(200);

  const data = await response.json();

  // проверяем что есть массив продуктов
  expect(data.products).toBeTruthy();
  expect(data.products.length).toBeGreaterThan(0);
});

test('API - login', async ({ request }) => {
  const response = await request.post('http://localhost:5000/api/users/login', {
    data: {
      email: 'admin@example.com',
      password: '123456',
    },
  });

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.token).toBeTruthy();
});