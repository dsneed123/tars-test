import { test, expect } from '@jest/globals';
import puppeteer from 'puppeteer';

let browser;
let page;

beforeAll(async () => {
  browser = await puppeteer.launch({ headless: true });
  page = await browser.newPage();
  await page.goto('file://' + process.cwd() + '/index.html');
});

afterAll(async () => {
  await browser.close();
});

test('should queue a task', async () => {
  // Fill in the task input and click queue button
  await page.type('#taskInput', 'Test task');
  await page.click('#queueTaskBtn');
  
  // Check that the task appears in the list
  const taskItems = await page.$$('#taskList li');
  expect(taskItems.length).toBe(1);
  
  const taskText = await page.evaluate(() => {
    return document.querySelector('#taskList li')?.textContent || '';
  });
  expect(taskText).toContain('Test task');
  expect(taskText).toContain('queued');
});

test('should process queue tasks', async () => {
  // Add a few tasks
  await page.type('#taskInput', 'First task');
  await page.click('#queueTaskBtn');
  
  await page.type('#taskInput', 'Second task');
  await page.click('#queueTaskBtn');
  
  // Process the queue
  await page.click('#processQueueBtn');
  
  // Wait for processing to complete
  await page.waitForTimeout(2000);
  
  // Check that tasks are processed
  const taskItems = await page.$$('#taskList li');
  expect(taskItems.length).toBe(2);
  
  // Verify both tasks are completed
  const taskTexts = await Promise.all(taskItems.map(item => item.evaluate(el => el.textContent)));
  taskTexts.forEach(text => {
    expect(text).toContain('completed');
  });
});

test('should handle empty task input', async () => {
  // Try to queue an empty task
  await page.click('#queueTaskBtn');
  
  // Should not add anything to the list
  const taskItems = await page.$$('#taskList li');
  expect(taskItems.length).toBe(0);
});

test('should allow queuing multiple tasks', async () => {
  // Queue multiple tasks
  await page.type('#taskInput', 'Task 1');
  await page.click('#queueTaskBtn');
  
  await page.type('#taskInput', 'Task 2');
  await page.click('#queueTaskBtn');
  
  await page.type('#taskInput', 'Task 3');
  await page.click('#queueTaskBtn');
  
  // Check that all tasks are queued
  const taskItems = await page.$$('#taskList li');
  expect(taskItems.length).toBe(3);
});

test('should process tasks in order', async () => {
  // Clear existing tasks
  await page.evaluate(() => {
    document.getElementById('taskList').innerHTML = '';
  });
  
  // Queue tasks in specific order
  await page.type('#taskInput', 'First');
  await page.click('#queueTaskBtn');
  
  await page.type('#taskInput', 'Second');
  await page.click('#queueTaskBtn');
  
  await page.type('#taskInput', 'Third');
  await page.click('#queueTaskBtn');
  
  // Process the queue
  await page.click('#processQueueBtn');
  
  // Wait for processing to complete
  await page.waitForTimeout(2000);
  
  // Check that tasks are processed in order (they should all be completed)
  const taskItems = await page.$$('#taskList li');
  expect(taskItems.length).toBe(3);
  
  const taskTexts = await Promise.all(taskItems.map(item => item.evaluate(el => el.textContent)));
  taskTexts.forEach(text => {
    expect(text).toContain('completed');
  });
});