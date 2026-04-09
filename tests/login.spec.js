import { test, expect } from '@playwright/test';

const email = 'admin@example.com';
const password = '123456';

test('valid login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  await page.click('button:has-text("Sign In")');

  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('button', { name: 'Admin User' })).toBeVisible();
});


test('invalid login', async ({ page }) => {
  await page.goto('http://localhost:3000/login');

  await page.fill('input[type="email"]', 'wrong@test.com');
  await page.fill('input[type="password"]', 'wrong');

  await page.click('button:has-text("Sign In")');

  await expect(page.locator('.alert-danger')).toBeVisible();
});


test('add product to cart', async ({ page }) => {
  await page.goto('http://localhost:3000');

  await page.click('.card a'); // первый товар
  await page.click('button:has-text("Add To Cart")');

  await expect(page).toHaveURL(/cart/);
});


test('checkout flow', async ({ page }) => {
  // логин
  await page.goto('http://localhost:3000/login');

  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button:has-text("Sign In")');

  await page.waitForLoadState('networkidle');

  // добавляем товар
  await page.goto('http://localhost:3000');

  await page.click('.card a');
  await page.click('button:has-text("Add To Cart")');

  // проверяем что мы в cart
  await expect(page).toHaveURL(/cart/);

  // ВАЖНО: проверяем что есть Subtotal (это всегда есть если есть товар)
  await expect(page.locator('text=Subtotal')).toBeVisible();

  // теперь кнопка активна
  await page.click('button:has-text("Proceed To Checkout")');

  await expect(page).toHaveURL(/shipping/);
});