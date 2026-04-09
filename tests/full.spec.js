import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000';
const apiURL = 'http://localhost:5000';
const email = 'admin@example.com';
const password = '123456';

/* =========================
   UI TESTS
========================= */

// 1
test('valid login', async ({ page }) => {
  await page.goto(`${baseURL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');
  await expect(page.getByRole('button', { name: 'Admin User' })).toBeVisible();
});

// 2
test('invalid login', async ({ page }) => {
  await page.goto(`${baseURL}/login`);
  await page.fill('input[type="email"]', 'wrong@test.com');
  await page.fill('input[type="password"]', 'wrong');
  await page.click('button:has-text("Sign In")');
  await expect(page.locator('.alert-danger')).toBeVisible();
});

// 3
test('empty login', async ({ page }) => {
  await page.goto(`${baseURL}/login`);
  await page.click('button:has-text("Sign In")');
  await expect(page.locator('.alert-danger')).toBeVisible();
});

// 4
test('open product page', async ({ page }) => {
  await page.goto(baseURL);
  await page.click('.card a');
  await expect(page.locator('button:has-text("Add To Cart")')).toBeVisible();
});

// 5
test('add to cart', async ({ page }) => {
  await page.goto(baseURL);
  await page.click('.card a');
  await page.click('button:has-text("Add To Cart")');
  await expect(page).toHaveURL(/cart/);
});

// 6
test('cart subtotal visible', async ({ page }) => {
  await page.goto(baseURL);
  await page.click('.card a');
  await page.click('button:has-text("Add To Cart")');
  await expect(page.locator('text=Subtotal')).toBeVisible();
});

// 7
test('increase quantity', async ({ page }) => {
  await page.goto(baseURL);
  await page.click('.card a');
  await page.click('button:has-text("Add To Cart")');
  await page.selectOption('select', '2');
  await expect(page.locator('select')).toHaveValue('2');
});

// 8
test('remove from cart', async ({ page }) => {
  await page.goto(baseURL);

  await page.click('.card a');
  await page.click('button:has-text("Add To Cart")');

  // ждём cart
  await expect(page.locator('text=Subtotal')).toBeVisible();

  // удаляем через кнопку (обычно это btn-light)
  await page.click('.btn-light');

  // проверяем что корзина пустая
  await expect(page.locator('text=Your cart is empty')).toBeVisible();
});

// 9
test('checkout flow', async ({ page }) => {
  await page.goto(`${baseURL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');

  await page.goto(baseURL);
  await page.click('.card a');
  await page.click('button:has-text("Add To Cart")');

  await expect(page.locator('text=Subtotal')).toBeVisible();
  await page.click('button:has-text("Proceed To Checkout")');
  await expect(page).toHaveURL(/shipping/);
});

// 10
test('logout', async ({ page }) => {
  await page.goto(`${baseURL}/login`);

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Sign In")');

  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Admin User' }).click();
  await page.click('text=Logout');

  // правильное ожидание
  await expect(page).toHaveURL(/login/);
});
/* =========================
   API TESTS
========================= */

// 11
test('API get products', async ({ request }) => {
  const res = await request.get(`${apiURL}/api/products`);
  expect(res.status()).toBe(200);
});

// 12
test('API products not empty', async ({ request }) => {
  const res = await request.get(`${apiURL}/api/products`);
  const data = await res.json();
  expect(data.products.length).toBeGreaterThan(0);
});

// 13
test('API login success', async ({ request }) => {
  const res = await request.post(`${apiURL}/api/users/login`, {
    data: { email, password }
  });
  expect(res.status()).toBe(200);
});

// 14
test('API login fail', async ({ request }) => {
  const res = await request.post(`${apiURL}/api/users/login`, {
    data: { email: 'bad@test.com', password: '123' }
  });
  expect(res.status()).toBe(401);
});

// 15
test('API get single product', async ({ request }) => {
  const res = await request.get(`${apiURL}/api/products`);
  const data = await res.json();
  const id = data.products[0]._id;

  const res2 = await request.get(`${apiURL}/api/products/${id}`);
  expect(res2.status()).toBe(200);
});

// 16
test('API response time', async ({ request }) => {
  const start = Date.now();
  await request.get(`${apiURL}/api/products`);
  const time = Date.now() - start;
  expect(time).toBeLessThan(2000);
});

// 17
test('API headers', async ({ request }) => {
  const res = await request.get(`${apiURL}/api/products`);
  expect(res.headers()['content-type']).toContain('application/json');
});

// 18
test('API pagination works', async ({ request }) => {
  const res = await request.get(`${apiURL}/api/products?page=1`);
  expect(res.status()).toBe(200);
});

// 19
test('API unauthorized profile', async ({ request }) => {
  const res = await request.get(`${apiURL}/api/users/profile`);
  expect(res.status()).toBe(401);
});

// 20
test('homepage loads', async ({ page }) => {
  const start = Date.now();
  await page.goto(baseURL);
  const time = Date.now() - start;
  expect(time).toBeLessThan(3000);
});