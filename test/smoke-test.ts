import puppeteer, { Browser, Page } from 'puppeteer';
import chalk from 'chalk';
import yargs from 'yargs';
import fs from 'fs';
import path from 'path';

interface Config {
  testServer: {
    port: number;
    host: string;
  };
  browser: {
    headless: boolean;
    slowMo: number;
    args: string[];
  };
  timeout: {
    pageLoad: number;
    interaction: number;
  };
  reporting: {
    verbose: boolean;
    logFile: string;
  };
}

interface TestResult {
  status: 'passed' | 'failed';
  message: string;
}

const configPath = path.join(__dirname, '..', 'test', 'config.yml');
let browser: Browser;
let page: Page;
let server;
let results: TestResult[] = [];

async function loadConfig(): Promise<Config> {
  const configFile = fs.readFileSync(configPath, 'utf8');
  return YAML.parse(configFile);
}

function log(message: string) {
  console.log(chalk.blue(`[LOG] ${message}`));
}

function error(message: string) {
  console.error(chalk.red(`[ERROR] ${message}`));
}

async function startServer(port: number, host: string): Promise<void> {
  const express = require('express');
  const app = express();
  app.use(express.static(path.join(__dirname, '..', '..')));
  server = app.listen(port, host, () => {
    log(`Test server running at http://${host}:${port}`);
  });
}

async function stopServer(): Promise<void> {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
    log('Test server stopped');
  }
}

async function setupBrowser(config: Config): Promise<void> {
  browser = await puppeteer.launch({
    headless: config.browser.headless,
    slowMo: config.browser.slowMo,
    args: config.browser.args,
  });
  page = await browser.newPage();
}

async function teardownBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    log('Browser closed');
  }
}

async function runTests(config: Config): Promise<void> {
  try {
    await page.goto(`http://${config.testServer.host}:${config.testServer.port}/index.html`, { waitUntil: 'networkidle2', timeout: config.timeout.pageLoad * 1000 });
    log('Page loaded successfully');

    // Test HTML structure
    const title = await page.title();
    if (title !== 'TARS Integration Demo') {
      results.push({ status: 'failed', message: `Incorrect page title: ${title}` });
    } else {
      results.push({ status: 'passed', message: 'Page title is correct' });
    }

    // Test TARS integration points (example)
    const tarsElement = await page.$('#tars-integration');
    if (!tarsElement) {
      results.push({ status: 'failed', message: 'TARS integration element not found' });
    } else {
      results.push({ status: 'passed', message: 'TARS integration element found' });
    }

    // Test interactive elements (example)
    const button = await page.$('#test-button');
    if (!button) {
      results.push({ status: 'failed', message: 'Test button not found' });
    } else {
      await button.click();
      log('Button clicked successfully');

      // Check for expected result after interaction
      const resultText = await page.$eval('#result-text', el => el.textContent);
      if (resultText !== 'Button Clicked') {
        results.push({ status: 'failed', message: `Incorrect result text: ${resultText}` });
      } else {
        results.push({ status: 'passed', message: 'Result text is correct' });
      }
    }
  } catch (err) {
    error(`Test failed with error: ${err.message}`);
    results.push({ status: 'failed', message: `Error during test execution: ${err.message}` });
  }
}

async function reportResults(config: Config): Promise<void> {
  const logFilePath = path.join(__dirname, '..', config.reporting.logFile);
  let reportContent = '';

  results.forEach((result) => {
    if (config.reporting.verbose || result.status === 'failed') {
      reportContent += `${result.status.toUpperCase()}: ${result.message}\n`;
    }
  });

  fs.writeFileSync(logFilePath, reportContent);
  log(`Test results logged to ${logFilePath}`);
}

async function main(): Promise<void> {
  const config = await loadConfig();

  process.on('SIGINT', async () => {
    error('Received SIGINT. Shutting down gracefully...');
    await teardownBrowser();
    await stopServer();
    reportResults(config);
    process.exit(1);
  });

  try {
    log('Starting TARS smoke test...');
    await startServer(config.testServer.port, config.testServer.host);
    await setupBrowser(config);
    await runTests(config);
    await teardownBrowser();
    await stopServer();
    await reportResults(config);
  } catch (err) {
    error(`Main execution failed with error: ${err.message}`);
    process.exit(1);
  }
}

main().catch((err) => {
  error(`Main function caught an unhandled error: ${err.message}`);
  process.exit(1);
});
