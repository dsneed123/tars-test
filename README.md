# tars-test

A simple demonstration project showcasing the integration of TARS, an AI assistant for software development and business.

## Running Locally
1. Clone the repository:
   ```bash
git clone https://github.com/dsneed123/tars-test.git
cd tars-test
```
2. Install dependencies:
   ```bash
npm install
```
3. Run the smoke test:
   ```bash
npm run smoke-test
```

## Task Queue Implementation

This project now includes a task queuing system that demonstrates how to queue tasks for execution.

### Features:
- Add tasks to a queue via input field and "Queue Task" button
- Process queued tasks with "Process Queue" button
- Tasks display their current status (queued, processing, completed)
- Tasks are processed in FIFO order
- Supports task prioritization

The implementation is contained within the `index.html` file and uses modern JavaScript classes to manage the queue functionality.

## Testing

- The project includes a CLI-based smoke test suite that validates HTML page loading, TARS integration functionality, and interactive elements.
- Test results are logged to `test/results.log`.
