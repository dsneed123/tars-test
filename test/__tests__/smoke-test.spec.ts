import { loadConfig, runTests } from '../smoke-test';
import puppeteer, { Browser, Page } from 'puppeteer';

jest.mock('fs');
jest.mock('yaml');
jest.mock('puppeteer');

const mockLoadConfig = jest.fn();
const mockRunTests = jest.fn();

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

describe('smoke-test', () => {
  describe('loadConfig', () => {
    it('should load configuration from YAML file', async () => {
      const mockConfig = {
        testServer: { port: 3000, host: 'localhost' },
        browser: { headless: true, slowMo: 50, args: ['no-sandbox'] },
        timeout: { pageLoad: 30, interaction: 10 },
        reporting: { verbose: false, logFile: 'test/results.log' }
      };

      require('yaml').parse = jest.fn().mockReturnValue(mockConfig);
      const config = await loadConfig();

      expect(config).toEqual(mockConfig);
    });
  });

  describe('runTests', () => {
    let browser: Browser;
    let page: Page;

    beforeEach(async () => {
      browser = await puppeteer.launch({ headless: true, slowMo: 50, args: ['no-sandbox'] });
      page = await browser.newPage();
    });

    afterEach(async () => {
      if (browser) {
        await browser.close();
      }
    });

    it('should run tests successfully', async () => {
      const mockConfig = {
        testServer: { port: 3000, host: 'localhost' },
        browser: { headless: true, slowMo: 50, args: ['no-sandbox'] },
        timeout: { pageLoad: 30, interaction: 10 },
        reporting: { verbose: false, logFile: 'test/results.log' }
      };

      await runTests(mockConfig);

      expect(page.goto).toHaveBeenCalledWith('http://localhost:3000/index.html', { waitUntil: 'networkidle2', timeout: 30 * 1000 });
    });
  });
});
