// Node.js test script with 60s timeout per test
const https = require('https');

const API_URL = 'https://codejunc-backend.onrender.com/api/execute';

function postExecution(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL);
    const data = JSON.stringify(payload);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 60000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out after 60s'));
    });

    req.write(data);
    req.end();
  });
}

async function runSingleTest(name, payload) {
  console.log(`\n=== Testing ${name} ===`);
  const start = Date.now();
  try {
    const res = await postExecution(payload);
    console.log(`Finished in ${Date.now() - start}ms:`, JSON.stringify(res, null, 2));
    return res;
  } catch (err) {
    console.error(`Failed after ${Date.now() - start}ms:`, err.message);
    return null;
  }
}

async function runAll() {
  // 1. Python test
  await runSingleTest('Python stdin (input())', {
    language: 'python',
    sourceCode: 'name = input()\nage = input()\nprint(f"Name: {name}, Age: {age}")',
    stdin: 'CodeJunc\n21',
  });

  // 2. Java Scanner test
  await runSingleTest('Java Scanner stdin', {
    language: 'java',
    sourceCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter your age: ");
        int age = sc.nextInt();

        System.out.println("Your age is: " + age);
        sc.close();
    }
}`,
    stdin: '21',
  });

  // 3. C scanf test
  await runSingleTest('C scanf stdin', {
    language: 'c',
    sourceCode: `#include <stdio.h>
int main() {
    int x;
    if (scanf("%d", &x) == 1) {
        printf("C Output: %d\\n", x * 10);
    }
    return 0;
}`,
    stdin: '5',
  });

  // 4. C++ cin test
  await runSingleTest('C++ cin stdin', {
    language: 'cpp',
    sourceCode: `#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << "Sum: " << (a + b) << endl;
    }
    return 0;
}`,
    stdin: '15 25',
  });

  // 5. JavaScript stdin test
  await runSingleTest('JavaScript stdin', {
    language: 'javascript',
    sourceCode: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
console.log("JS Echo:", input);`,
    stdin: 'Terminal-Style Stdin Echo',
  });
}

runAll();
