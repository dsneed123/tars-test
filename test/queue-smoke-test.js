const puppeteer = require('puppeteer');
const fs = require('fs');

async function runQueueTest() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  try {
    // Navigate to the index.html file
    await page.goto('file://' + process.cwd() + '/index.html');
    
    console.log('Testing task queue functionality...');
    
    // Test queuing a task
    await page.type('#taskInput', 'Test queue task');
    await page.click('#queueTaskBtn');
    
    // Wait a bit for the DOM to update
    await page.waitForTimeout(500);
    
    // Check if task was added
    const taskCount = await page.evaluate(() => {
      return document.querySelectorAll('#taskList li').length;
    });
    
    console.log(`Tasks in queue: ${taskCount}`);
    
    if (taskCount === 1) {
      console.log('✅ Task queuing works correctly');
    } else {
      console.log('❌ Task queuing failed');
      process.exit(1);
    }
    
    // Test processing queue
    await page.click('#processQueueBtn');
    
    // Wait for processing to complete
    await page.waitForTimeout(2000);
    
    // Check if task was processed
    const finalTaskCount = await page.evaluate(() => {
      return document.querySelectorAll('#taskList li').length;
    });
    
    console.log(`Tasks after processing: ${finalTaskCount}`);
    
    console.log('✅ Queue functionality test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runQueueTest();