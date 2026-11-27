import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Documentation() {
  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="page-content docs-layout">
        <aside className="docs-sidebar">
          <nav className="docs-nav" aria-label="Documentation Navigation">
            <h3 className="docs-nav-title">Guides</h3>
            <a href="#quick-start" className="docs-nav-item">Quick Start</a>
            <a href="#shortcuts" className="docs-nav-item">Keyboard Shortcuts</a>
            <a href="#stdin" className="docs-nav-item">Standard Input (stdin)</a>

            <h3 className="docs-nav-title">Runtimes</h3>
            <a href="#python" className="docs-nav-item">Python 3.11</a>
            <a href="#javascript" className="docs-nav-item">JavaScript ES2024</a>
            <a href="#cpp" className="docs-nav-item">C / C++ (GCC 13)</a>
            <a href="#java" className="docs-nav-item">Java (OpenJDK 21)</a>

            <h3 className="docs-nav-title">Customization</h3>
            <a href="#themes" className="docs-nav-item">Themes & Tokens</a>
            <a href="#privacy" className="docs-nav-item">Client Execution & Privacy</a>
          </nav>
        </aside>

        <article className="docs-article">
          <div className="docs-header">
            <span className="page-badge">DEVELOPER GUIDE</span>
            <h1 className="docs-title"><span className="brand-code">Code</span><span className="brand-junc">Junc</span> Documentation</h1>
            <p className="docs-lead">
              Everything you need to know about developing, testing, and running code in CodeJunc's zero-setup client-side coding platform.
            </p>
          </div>

          <section id="quick-start" className="docs-section">
            <h2>Quick Start</h2>
            <p>
              CodeJunc requires zero installation, no backend containers to spin up, and no account signup. Simply choose your programming language from the topbar or the Languages directory, start typing code in the Monaco editor, and press <code>Ctrl + Enter</code> to run.
            </p>
            <div className="docs-callout">
              <strong>Tip:</strong> Refreshing the page while inside the compiler workspace preserves your active route, code buffer, and language selection automatically.
            </div>
          </section>

          <section id="shortcuts" className="docs-section">
            <h2>Keyboard Shortcuts</h2>
            <table className="docs-table">
              <thead>
                <tr>
                  <th>Shortcut</th>
                  <th>Action</th>
                  <th>Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><kbd>Ctrl</kbd> + <kbd>↵ Enter</kbd> (or <kbd>⌘</kbd> + <kbd>↵</kbd>)</td>
                  <td>Execute currently active program</td>
                  <td>Global / Monaco Editor</td>
                </tr>
                <tr>
                  <td><kbd>↵ Enter</kbd></td>
                  <td>Navigate to Language Selection</td>
                  <td>Welcome Page</td>
                </tr>
                <tr>
                  <td><kbd>Esc</kbd></td>
                  <td>Close open dropdown menus</td>
                  <td>Global</td>
                </tr>
                <tr>
                  <td><kbd>Tab</kbd> / <kbd>Shift + Tab</kbd></td>
                  <td>Indent / Outdent selection</td>
                  <td>Monaco Editor</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section id="stdin" className="docs-section">
            <h2>Standard Input (stdin)</h2>
            <p>
              Programs requiring user input (e.g. Python <code>input()</code>, C++ <code>cin</code>, or Java <code>Scanner</code>) read values from the <strong>Input</strong> tab in the bottom console panel.
            </p>
            <p>
              Enter input tokens separated by whitespace or newline characters before running your code. When your code requests a token, the runner automatically supplies the next available input item.
            </p>
            <pre className="docs-code-block">
              <code>{`# Example Python reading from stdin:
name = input("Enter name: ")
age = int(input("Enter age: "))
print(f"Hello {name}, you are {age} years old!")`}</code>
            </pre>
          </section>

          <section id="python" className="docs-section">
            <h2>Python 3.11 Runtime</h2>
            <p>
              The Python execution engine runs modern Python 3.11 syntax client-side with full support for data structures (lists, dicts, sets, tuples), comprehensions, lambda expressions, mathematical functions, string manipulation, and recursive algorithms.
            </p>
          </section>

          <section id="javascript" className="docs-section">
            <h2>JavaScript (ES2024) Runtime</h2>
            <p>
              JavaScript runs directly in an isolated <code>Web Worker</code> thread. This prevents long-running loops or calculations from freezing the UI, providing maximum speed and native browser engine performance.
            </p>
          </section>

          <section id="cpp" className="docs-section">
            <h2>C & C++ Runtimes</h2>
            <p>
              C and C++ code is parsed and interpreted with an AST evaluator supporting standard primitives, control flow, functions, arrays, pointers, <code>printf</code>, <code>scanf</code>, <code>std::cout</code>, <code>std::cin</code>, and common STL structures like <code>std::vector</code>.
            </p>
          </section>

          <section id="java" className="docs-section">
            <h2>Java Runtime</h2>
            <p>
              Java code executes within a structured class environment with <code>public class Main</code> and <code>public static void main(String[] args)</code> entry points. Output is streamed to the unified console.
            </p>
          </section>

          <section id="themes" className="docs-section">
            <h2>Theme Customization</h2>
            <p>CodeJunc features four bespoke themes:</p>
            <ul>
              <li><strong>Dark:</strong> GitHub Dark inspired theme designed for long coding sessions.</li>
              <li><strong>Light:</strong> Clean, high-contrast light theme.</li>
              <li><strong>Crimson Forge:</strong> Deep obsidian black with garnet and warm gold highlights.</li>
              <li><strong>United:</strong> Pitch black with signature Manchester United red and gold accents.</li>
            </ul>
            <p>
              First-time visitors automatically adopt their operating system theme preference (Light or Dark), with instant persistence upon manual selection.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
