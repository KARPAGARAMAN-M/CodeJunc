# CodeJunc — Full-Stack Developer Coding Platform

CodeJunc is an online coding practice platform built with a React frontend and a Spring Boot 3 backend. It allows users to write code with Monaco Editor, provide custom input (`stdin`), execute code across multiple programming languages, and view genuine compiler output, errors, and runtime stats.

---

## 1. Project Structure

```text
CodeJunc/
│
├── frontend (root)/
│   ├── src/
│   │   ├── components/     # CodeEditor, OutputPanel, Navbar, ThemeToggle, etc.
│   │   ├── context/        # ThemeContext
│   │   ├── pages/          # Welcome, Compiler, LanguageSelection, etc.
│   │   └── utils/          # runner.js (calls /api/execute), languages.js, monacoThemes.js
│   ├── public/             # Static brand assets and favicons
│   ├── vite.config.js      # Vite dev server + proxy to backend (/api -> localhost:8080)
│   └── package.json
│
└── backend/
    ├── src/
    │   ├── main/
    │   │   ├── java/com/codejunc/
    │   │   │   ├── controller/      # ExecutionController (POST /api/execute)
    │   │   │   ├── service/         # Judge0Service (Judge0 integration & polling)
    │   │   │   ├── dto/             # ExecuteRequest, ExecuteResponse, Judge0 DTOs
    │   │   │   ├── config/          # Judge0Properties, WebConfig (CORS), RateLimitFilter
    │   │   │   ├── exception/       # GlobalExceptionHandler, Custom Exceptions
    │   │   │   └── CodeJuncApplication.java
    │   │   └── resources/
    │   │       └── application.yml  # Spring Boot configuration
    │   └── test/
    │       └── java/com/codejunc/   # Unit and integration tests
    ├── .env.example                 # Example environment variables
    └── pom.xml                      # Maven build descriptor (Java 21, Spring Boot 3)
```

---

## 2. Supported Languages & Judge0 Mapping

The backend maps language identifiers to Judge0 CE language IDs:

| Language | CodeJunc Key | Judge0 Language ID | Runtime / Compiler |
| :--- | :--- | :--- | :--- |
| **C** | `c` | `50` | GCC 9.2.0 |
| **C++** | `cpp` | `54` | G++ 9.2.0 |
| **Java** | `java` | `62` | OpenJDK 13.0.1 |
| **Python** | `python` | `71` | Python 3.8.1 |
| **JavaScript** | `javascript` | `63` | Node.js 12.14.0 |

---

## 3. API Specification

### `POST /api/execute`

Executes source code with optional standard input (`stdin`).

#### Request Body
```json
{
  "language": "python",
  "sourceCode": "name = input()\nprint('Hello', name)",
  "stdin": "Karpagaram"
}
```

#### Response Body (`200 OK`)
```json
{
  "status": "Accepted",
  "stdout": "Hello Karpagaram\n",
  "stderr": null,
  "compileOutput": null,
  "message": null,
  "time": "0.02",
  "memory": 3500
}
```

#### Error Response (`400 Bad Request` or `502 Bad Gateway`)
```json
{
  "status": "Compilation Error",
  "stdout": null,
  "stderr": null,
  "compileOutput": "main.cpp: In function 'int main()':\nmain.cpp:5:5: error: expected ';' before 'return'",
  "message": null,
  "time": null,
  "memory": null
}
```

### `GET /api/health`
Health check verifying the backend service status.

---

## 4. Setup and Execution

### Quick Start (Single Command)

Run both the Spring Boot backend and Vite frontend concurrently with one command from the project root:

```bash
npm run dev
```

This starts:
- **Spring Boot Backend**: `http://localhost:8080` (with live logs prefixed with `[backend]`)
- **React Frontend**: `http://localhost:3000` (with live logs prefixed with `[frontend]`)
- Proxy: Calls from the frontend to `/api` are automatically proxied to port 8080.

Press `Ctrl + C` at any time to cleanly stop both processes.

---

### Running Services Separately (Optional)

If you prefer to run services in separate terminal tabs:

#### Starting the Spring Boot Backend
```bash
npm run dev:backend
# or: cd backend && mvn spring-boot:run
```

#### Starting the React Frontend
```bash
npm run dev:frontend
```

---

## 5. Security & Isolation

1. **Sandboxed Code Execution**: User-submitted code is never executed directly inside the Spring Boot container. It runs in an isolated Judge0 container sandbox with CPU and memory limits.
2. **Standard Input Integration**: Stdin is passed directly to the Judge0 runtime, supporting single-line, multiline, string, and numeric inputs.
3. **Rate Limiting**: Built-in sliding window rate limiter protects the API against spam and abuse (30 requests/minute per client IP).
4. **Validation**: Enforces 64KB maximum limits on code and stdin, and validates language identifiers.
5. **CORS Protection**: Restricted to authorized origins (`http://localhost:3000`).
