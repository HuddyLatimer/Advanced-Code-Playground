class AdvancedCodePlayground {
    constructor() {
      this.files = new Map()
      this.activeFile = null
      this.editors = new Map()
      this.themes = {
        dark: "dark",
        light: "light",
        "high-contrast": "high-contrast",
        monokai: "monokai",
        solarized: "solarized",
      }
      this.currentTheme = "dark"
      this.settings = {
        fontSize: 14,
        tabSize: 4,
        wordWrap: true,
        lineNumbers: true,
        minimap: true,
        autoSave: true,
        livePreview: true,
      }
      this.commandHistory = []
      this.searchHistory = []
      this.undoStack = []
      this.redoStack = []
      this.isLoading = true
      this.notifications = []
      this.problems = []
      this.consoleEntries = []
      this.networkRequests = []
      this.performanceMetrics = {
        loadTime: 0,
        domNodes: 0,
        memoryUsage: 0,
        bundleSize: 0,
      }
  
      this.init()
    }
  
    async init() {
      await this.showLoadingScreen()
      this.setupEventListeners()
      this.setupKeyboardShortcuts()
      this.setupFileSystem()
      this.setupTheme()
      this.setupDefaultFiles()
      this.setupPreview()
      this.setupConsole()
      this.setupTerminal()
      this.hideLoadingScreen()
      this.showNotification("Welcome to Advanced Code Playground!", "success")
    }
  
    async showLoadingScreen() {
      const loadingScreen = document.getElementById("loading-screen")
      const progress = document.querySelector(".loading-progress")
      const status = document.querySelector(".loading-status")
  
      const steps = [
        "Initializing file system...",
        "Loading syntax highlighter...",
        "Setting up preview environment...",
        "Configuring development tools...",
        "Starting language servers...",
        "Ready!",
      ]
  
      for (let i = 0; i < steps.length; i++) {
        status.textContent = steps[i]
        progress.style.width = `${((i + 1) / steps.length) * 100}%`
        await new Promise((resolve) => setTimeout(resolve, 300))
      }
    }
  
    hideLoadingScreen() {
      const loadingScreen = document.getElementById("loading-screen")
      const app = document.getElementById("app")
  
      setTimeout(() => {
        loadingScreen.style.opacity = "0"
        setTimeout(() => {
          loadingScreen.style.display = "none"
          app.classList.remove("hidden")
        }, 300)
      }, 500)
    }
  
    setupEventListeners() {
      // Toolbar buttons
      document.getElementById("new-file").addEventListener("click", () => this.createNewFile())
      document.getElementById("save-file").addEventListener("click", () => this.saveCurrentFile())
      document.getElementById("save-all").addEventListener("click", () => this.saveAllFiles())
      document.getElementById("run-code").addEventListener("click", () => this.runCode())
      document.getElementById("format-code").addEventListener("click", () => this.formatCode())
      document.getElementById("find").addEventListener("click", () => this.showFindWidget())
      document.getElementById("settings").addEventListener("click", () => this.showSettings())
  
      // Theme selector
      document.getElementById("theme-selector").addEventListener("change", (e) => {
        this.setTheme(e.target.value)
      })
  
      // Sidebar tabs
      document.querySelectorAll(".sidebar-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => this.switchSidebarPanel(e.target.dataset.panel))
      })
  
      // Preview tabs
      document.querySelectorAll(".preview-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => this.switchPreviewPanel(e.target.dataset.preview))
      })
  
      // Bottom tabs
      document.querySelectorAll(".bottom-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => this.switchBottomPanel(e.target.dataset.bottom))
      })
  
      // Find widget
      document.getElementById("find-close").addEventListener("click", () => this.hideFindWidget())
      document.getElementById("find-input").addEventListener("input", (e) => this.performFind(e.target.value))
      document.getElementById("find-next").addEventListener("click", () => this.findNext())
      document.getElementById("find-prev").addEventListener("click", () => this.findPrevious())
  
      // Console input
      document.getElementById("console-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.executeConsoleCommand(e.target.value)
          e.target.value = ""
        }
      })
  
      // Terminal input
      document.getElementById("terminal-input").addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          this.executeTerminalCommand(e.target.value)
          e.target.value = ""
        }
      })
  
      // Device selector
      document.getElementById("device-selector").addEventListener("change", (e) => {
        this.setPreviewDevice(e.target.value)
      })
  
      // Preview controls
      document.getElementById("refresh-preview").addEventListener("click", () => this.refreshPreview())
      document.getElementById("fullscreen-preview").addEventListener("click", () => this.toggleFullscreenPreview())
  
      // Resizers
      this.setupResizers()
  
      // Context menu
      document.addEventListener("contextmenu", (e) => this.showContextMenu(e))
      document.addEventListener("click", () => this.hideContextMenu())
  
      // Auto-save
      setInterval(() => {
        if (this.settings.autoSave) {
          this.autoSave()
        }
      }, 30000)
    }
  
    setupKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Command palette
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "P") {
          e.preventDefault()
          this.showCommandPalette()
        }
  
        // File operations
        if ((e.ctrlKey || e.metaKey) && e.key === "n") {
          e.preventDefault()
          this.createNewFile()
        }
  
        if ((e.ctrlKey || e.metaKey) && e.key === "s") {
          e.preventDefault()
          if (e.shiftKey) {
            this.saveAllFiles()
          } else {
            this.saveCurrentFile()
          }
        }
  
        // Edit operations
        if ((e.ctrlKey || e.metaKey) && e.key === "z") {
          e.preventDefault()
          if (e.shiftKey) {
            this.redo()
          } else {
            this.undo()
          }
        }
  
        if ((e.ctrlKey || e.metaKey) && e.key === "y") {
          e.preventDefault()
          this.redo()
        }
  
        // Find and replace
        if ((e.ctrlKey || e.metaKey) && e.key === "f") {
          e.preventDefault()
          this.showFindWidget()
        }
  
        if ((e.ctrlKey || e.metaKey) && e.key === "h") {
          e.preventDefault()
          this.showFindWidget(true)
        }
  
        // Code operations
        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
          e.preventDefault()
          this.toggleComment()
        }
  
        if (e.shiftKey && e.altKey && e.key === "F") {
          e.preventDefault()
          this.formatCode()
        }
  
        // Run code
        if (e.key === "F5") {
          e.preventDefault()
          this.runCode()
        }
  
        // Debug
        if (e.key === "F9") {
          e.preventDefault()
          this.debugCode()
        }
  
        // Close find widget
        if (e.key === "Escape") {
          this.hideFindWidget()
          this.hideCommandPalette()
        }
      })
    }
  
    setupFileSystem() {
      // Initialize with default project structure
      this.files.set("index.html", {
        name: "index.html",
        type: "html",
        content: `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Advanced Code Playground</title>
      <link rel="stylesheet" href="styles.css">
  </head>
  <body>
      <div class="container">
          <header class="hero">
              <h1>🚀 Welcome to Advanced Code Playground</h1>
              <p>The most advanced browser-based IDE for web development</p>
              <button class="cta-button" onclick="startCoding()">Start Coding</button>
          </header>
          
          <section class="features">
              <div class="feature-card">
                  <h3>🎨 Advanced Editor</h3>
                  <p>Syntax highlighting, auto-completion, and intelligent code analysis</p>
              </div>
              <div class="feature-card">
                  <h3>🔍 Live Preview</h3>
                  <p>See your changes instantly with our real-time preview system</p>
              </div>
              <div class="feature-card">
                  <h3>🛠️ Developer Tools</h3>
                  <p>Built-in console, network monitor, and performance analyzer</p>
              </div>
          </section>
          
          <section class="demo">
              <h2>Interactive Demo</h2>
              <div id="demo-area">
                  <p>Click the button below to see some magic!</p>
                  <button onclick="createAnimation()">Create Animation</button>
                  <div id="animation-container"></div>
              </div>
          </section>
      </div>
      
      <script src="script.js"></script>
  </body>
  </html>`,
        modified: false,
        saved: true,
      })
  
      this.files.set("styles.css", {
        name: "styles.css",
        type: "css",
        content: `/* Advanced Code Playground Styles */
  * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
  }
  
  body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
  }
  
  .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
  }
  
  .hero {
      text-align: center;
      padding: 60px 0;
      color: white;
  }
  
  .hero h1 {
      font-size: 3.5rem;
      margin-bottom: 20px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      animation: fadeInUp 1s ease;
  }
  
  .hero p {
      font-size: 1.3rem;
      margin-bottom: 30px;
      opacity: 0.9;
      animation: fadeInUp 1s ease 0.2s both;
  }
  
  .cta-button {
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      color: white;
      border: none;
      padding: 15px 30px;
      font-size: 1.1rem;
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: fadeInUp 1s ease 0.4s both;
  }
  
  .cta-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
  }
  
  .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 60px 0;
  }
  
  .feature-card {
      background: rgba(255,255,255,0.95);
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      animation: fadeInUp 1s ease;
  }
  
  .feature-card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
  }
  
  .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #333;
  }
  
  .demo {
      background: rgba(255,255,255,0.95);
      padding: 40px;
      border-radius: 15px;
      margin: 40px 0;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }
  
  .demo h2 {
      font-size: 2rem;
      margin-bottom: 20px;
      color: #333;
  }
  
  .demo button {
      background: linear-gradient(45deg, #4ecdc4, #44a08d);
      color: white;
      border: none;
      padding: 12px 25px;
      font-size: 1rem;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 20px 0;
  }
  
  .demo button:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }
  
  #animation-container {
      min-height: 100px;
      margin-top: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
  }
  
  .animated-box {
      width: 50px;
      height: 50px;
      background: linear-gradient(45deg, #ff6b6b, #feca57);
      border-radius: 10px;
      animation: bounce 2s infinite;
      margin: 5px;
  }
  
  @keyframes fadeInUp {
      from {
          opacity: 0;
          transform: translateY(30px);
      }
      to {
          opacity: 1;
          transform: translateY(0);
      }
  }
  
  @keyframes bounce {
      0%, 20%, 50%, 80%, 100% {
          transform: translateY(0);
      }
      40% {
          transform: translateY(-20px);
      }
      60% {
          transform: translateY(-10px);
      }
  }
  
  @keyframes pulse {
      0% {
          transform: scale(1);
      }
      50% {
          transform: scale(1.1);
      }
      100% {
          transform: scale(1);
      }
  }
  
  /* Responsive Design */
  @media (max-width: 768px) {
      .hero h1 {
          font-size: 2.5rem;
      }
      
      .hero p {
          font-size: 1.1rem;
      }
      
      .features {
          grid-template-columns: 1fr;
          gap: 20px;
      }
      
      .container {
          padding: 10px;
      }
  }`,
        modified: false,
        saved: true,
      })
  
      this.files.set("script.js", {
        name: "script.js",
        type: "javascript",
        content: `// Advanced Code Playground JavaScript
  console.log('🚀 Advanced Code Playground loaded successfully!');
  
  // Animation counter
  let animationCount = 0;
  
  // Start coding function
  function startCoding() {
      console.log('Starting your coding journey!');
      
      // Add some visual feedback
      const button = event.target;
      const originalText = button.textContent;
      
      button.textContent = '🎉 Let\\'s Go!';
      button.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
      
      setTimeout(() => {
          button.textContent = originalText;
          button.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
      }, 2000);
      
      // Show welcome message
      showNotification('Welcome to your coding adventure!', 'success');
  }
  
  // Create animation function
  function createAnimation() {
      const container = document.getElementById('animation-container');
      animationCount++;
      
      // Create animated box
      const box = document.createElement('div');
      box.className = 'animated-box';
      box.style.animationDelay = \`\${Math.random() * 2}s\`;
      
      // Add random colors
      const colors = [
          'linear-gradient(45deg, #ff6b6b, #feca57)',
          'linear-gradient(45deg, #4ecdc4, #44a08d)',
          'linear-gradient(45deg, #a8edea, #fed6e3)',
          'linear-gradient(45deg, #ff9a9e, #fecfef)',
          'linear-gradient(45deg, #667eea, #764ba2)'
      ];
      
      box.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      container.appendChild(box);
      
      // Add click interaction
      box.addEventListener('click', function() {
          this.style.animation = 'pulse 0.5s ease';
          setTimeout(() => {
              this.style.animation = 'bounce 2s infinite';
          }, 500);
      });
      
      // Remove after some time to prevent overflow
      if (animationCount > 10) {
          const firstBox = container.firstChild;
          if (firstBox) {
              firstBox.remove();
              animationCount--;
          }
      }
      
      console.log(\`Created animation box #\${animationCount}\`);
  }
  
  // Notification system
  function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = \`notification \${type}\`;
      notification.innerHTML = \`
          <div class="notification-content">
              <strong>\${type.charAt(0).toUpperCase() + type.slice(1)}:</strong>
              \${message}
          </div>
      \`;
      
      notification.style.cssText = \`
          position: fixed;
          top: 20px;
          right: 20px;
          background: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease;
          max-width: 300px;
      \`;
      
      // Color based on type
      const colors = {
          success: '#4caf50',
          error: '#f44336',
          warning: '#ff9800',
          info: '#2196f3'
      };
      
      notification.style.borderLeft = \`4px solid \${colors[type] || colors.info}\`;
      
      document.body.appendChild(notification);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
          notification.style.animation = 'slideOut 0.3s ease';
          setTimeout(() => {
              if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
              }
          }, 300);
      }, 3000);
  }
  
  // Add CSS for notifications
  const notificationStyles = document.createElement('style');
  notificationStyles.textContent = \`
      @keyframes slideIn {
          from {
              transform: translateX(100%);
              opacity: 0;
          }
          to {
              transform: translateX(0);
              opacity: 1;
          }
      }
      
      @keyframes slideOut {
          from {
              transform: translateX(0);
              opacity: 1;
          }
          to {
              transform: translateX(100%);
              opacity: 0;
          }
      }
  \`;
  document.head.appendChild(notificationStyles);
  
  // Interactive features
  document.addEventListener('DOMContentLoaded', function() {
      console.log('DOM loaded, initializing interactive features...');
      
      // Add keyboard shortcuts
      document.addEventListener('keydown', function(e) {
          // Ctrl/Cmd + Enter to create animation
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              createAnimation();
          }
          
          // Space to start coding
          if (e.code === 'Space' && e.target === document.body) {
              e.preventDefault();
              const ctaButton = document.querySelector('.cta-button');
              if (ctaButton) {
                  ctaButton.click();
              }
          }
      });
      
      // Add mouse trail effect
      let mouseTrail = [];
      document.addEventListener('mousemove', function(e) {
          mouseTrail.push({x: e.clientX, y: e.clientY, time: Date.now()});
          
          // Keep only recent positions
          mouseTrail = mouseTrail.filter(pos => Date.now() - pos.time < 1000);
      });
      
      // Performance monitoring
      const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
              console.log(\`Performance: \${entry.name} took \${entry.duration}ms\`);
          }
      });
      
      observer.observe({entryTypes: ['measure', 'navigation']});
      
      // Welcome message
      setTimeout(() => {
          showNotification('Try clicking elements and using keyboard shortcuts!', 'info');
      }, 2000);
  });
  
  // Advanced features
  class CodePlaygroundAPI {
      constructor() {
          this.version = '2.0.0';
          this.features = [
              'Advanced Syntax Highlighting',
              'Real-time Collaboration',
              'Intelligent Code Completion',
              'Built-in Developer Tools',
              'Performance Monitoring',
              'Git Integration',
              'Plugin System'
          ];
      }
      
      getInfo() {
          return {
              version: this.version,
              features: this.features,
              timestamp: new Date().toISOString()
          };
      }
      
      executeCode(code, language = 'javascript') {
          console.log(\`Executing \${language} code:\`, code);
          
          try {
              if (language === 'javascript') {
                  return eval(code);
              }
          } catch (error) {
              console.error('Code execution error:', error);
              return { error: error.message };
          }
      }
  }
  
  // Initialize API
  window.playgroundAPI = new CodePlaygroundAPI();
  console.log('Playground API initialized:', window.playgroundAPI.getInfo());`,
        modified: false,
        saved: true,
      })
  
      this.updateFileTree()
    }
  
    setupDefaultFiles() {
      // Set the first file as active
      const firstFile = this.files.keys().next().value
      if (firstFile) {
        this.openFile(firstFile)
      }
    }
  
    setupTheme() {
      document.documentElement.setAttribute("data-theme", this.currentTheme)
    }
  
    setTheme(theme) {
      this.currentTheme = theme
      document.documentElement.setAttribute("data-theme", theme)
      this.showNotification(`Theme changed to ${theme}`, "success")
    }
  
    createNewFile() {
      const fileName = prompt("Enter file name:")
      if (!fileName) return
  
      const fileType = this.getFileType(fileName)
      const file = {
        name: fileName,
        type: fileType,
        content: this.getDefaultContent(fileType),
        modified: false,
        saved: false,
      }
  
      this.files.set(fileName, file)
      this.updateFileTree()
      this.openFile(fileName)
      this.showNotification(`Created new file: ${fileName}`, "success")
    }
  
    getFileType(fileName) {
      const extension = fileName.split(".").pop().toLowerCase()
      const typeMap = {
        html: "html",
        htm: "html",
        css: "css",
        js: "javascript",
        javascript: "javascript",
        json: "json",
        md: "markdown",
        txt: "text",
      }
      return typeMap[extension] || "text"
    }
  
    getDefaultContent(type) {
      const templates = {
        html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>',
        css: "/* CSS Styles */\n\n",
        javascript: "// JavaScript Code\n\n",
        json: "{\n    \n}",
        markdown: "# Markdown Document\n\n",
        text: "",
      }
      return templates[type] || ""
    }
  
    openFile(fileName) {
      const file = this.files.get(fileName)
      if (!file) return
  
      this.activeFile = fileName
      this.createEditorTab(fileName)
      this.createEditor(fileName)
      this.updateStatusBar()
      this.updatePreview()
    }
  
    createEditorTab(fileName) {
      const tabBar = document.getElementById("tab-bar")
      const file = this.files.get(fileName)
  
      // Remove existing tab if it exists
      const existingTab = document.querySelector(`[data-file="${fileName}"]`)
      if (existingTab) {
        existingTab.classList.add("active")
        document.querySelectorAll(".editor-tab").forEach((tab) => {
          if (tab !== existingTab) tab.classList.remove("active")
        })
        return
      }
  
      const tab = document.createElement("button")
      tab.className = "editor-tab active"
      tab.dataset.file = fileName
      tab.innerHTML = `
        <span class="tab-icon">${this.getFileIcon(file.type)}</span>
        <span class="tab-name">${fileName}</span>
        <button class="tab-close" onclick="event.stopPropagation(); playground.closeFile('${fileName}')">×</button>
      `
  
      tab.addEventListener("click", () => this.switchToFile(fileName))
  
      // Remove active class from other tabs
      document.querySelectorAll(".editor-tab").forEach((t) => t.classList.remove("active"))
  
      tabBar.appendChild(tab)
    }
  
    createEditor(fileName) {
      const container = document.getElementById("editor-container")
      const file = this.files.get(fileName)
  
      // Hide other editors
      document.querySelectorAll(".code-editor").forEach((editor) => {
        editor.classList.remove("active")
      })
  
      // Check if editor already exists
      let editor = document.getElementById(`editor-${fileName}`)
      if (editor) {
        editor.classList.add("active")
        return
      }
  
      // Create new editor
      editor = document.createElement("textarea")
      editor.id = `editor-${fileName}`
      editor.className = "code-editor active"
      editor.value = file.content
      editor.spellcheck = false
  
      // Add event listeners
      editor.addEventListener("input", () => this.onEditorInput(fileName))
      editor.addEventListener("keydown", (e) => this.onEditorKeyDown(e, fileName))
      editor.addEventListener("scroll", () => this.updateMinimap())
      editor.addEventListener("selectionchange", () => this.updateStatusBar())
  
      container.appendChild(editor)
      this.editors.set(fileName, editor)
  
      // Create syntax highlighting
      this.setupSyntaxHighlighting(fileName)
  
      // Create line numbers
      this.setupLineNumbers(fileName)
  
      // Focus the editor
      editor.focus()
    }
  
    setupSyntaxHighlighting(fileName) {
      const file = this.files.get(fileName)
      const editor = this.editors.get(fileName)
  
      // Create syntax highlight overlay
      const highlight = document.createElement("div")
      highlight.className = "syntax-highlight"
      highlight.id = `highlight-${fileName}`
  
      editor.parentNode.appendChild(highlight)
  
      this.updateSyntaxHighlighting(fileName)
    }
  
    updateSyntaxHighlighting(fileName) {
      const file = this.files.get(fileName)
      const highlight = document.getElementById(`highlight-${fileName}`)
      if (!highlight) return
  
      const content = file.content
      let highlightedContent = ""
  
      switch (file.type) {
        case "html":
          highlightedContent = this.highlightHTML(content)
          break
        case "css":
          highlightedContent = this.highlightCSS(content)
          break
        case "javascript":
          highlightedContent = this.highlightJavaScript(content)
          break
        default:
          highlightedContent = this.escapeHtml(content)
      }
  
      highlight.innerHTML = highlightedContent
    }
  
    highlightHTML(code) {
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/(&lt;\/?)([\w-]+)/g, '$1<span class="tag">$2</span>')
        .replace(/([\w-]+)=/g, '<span class="attribute">$1</span>=')
        .replace(/="([^"]*)"/g, '="<span class="value">$1</span>"')
        .replace(/&lt;!--[\s\S]*?--&gt;/g, '<span class="comment">$&</span>')
        .replace(/(&lt;!DOCTYPE[^&]*&gt;)/g, '<span class="keyword">$1</span>')
    }
  
    highlightCSS(code) {
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
        .replace(/([.#]?[\w-]+)(?=\s*{)/g, '<span class="selector">$1</span>')
        .replace(/([\w-]+)(?=\s*:)/g, '<span class="property">$1</span>')
        .replace(/:\s*([^;{]+)/g, ': <span class="value">$1</span>')
        .replace(/(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg|s|ms)?)/g, '<span class="number">$1</span>')
        .replace(/(#[0-9a-fA-F]{3,6})/g, '<span class="value">$1</span>')
    }
  
    highlightJavaScript(code) {
      const keywords = [
        "const",
        "let",
        "var",
        "function",
        "return",
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "break",
        "continue",
        "try",
        "catch",
        "finally",
        "throw",
        "class",
        "extends",
        "import",
        "export",
        "default",
        "async",
        "await",
        "true",
        "false",
        "null",
        "undefined",
        "typeof",
        "instanceof",
        "new",
        "this",
      ]
  
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\/\/.*$/gm, '<span class="comment">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>')
        .replace(/"([^"\\]|\\.)*"/g, '<span class="string">$&</span>')
        .replace(/'([^'\\]|\\.)*'/g, '<span class="string">$&</span>')
        .replace(/`([^`\\]|\\.)*`/g, '<span class="string">$&</span>')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>')
        .replace(new RegExp(`\\b(${keywords.join("|")})\\b`, "g"), '<span class="keyword">$1</span>')
        .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, '<span class="function">$1</span>')
    }
  
    escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    }
  
    setupLineNumbers(fileName) {
      const editor = this.editors.get(fileName)
      const lineNumbers = document.createElement("div")
      lineNumbers.className = "line-numbers"
      lineNumbers.id = `lines-${fileName}`
  
      editor.parentNode.appendChild(lineNumbers)
      this.updateLineNumbers(fileName)
    }
  
    updateLineNumbers(fileName) {
      const file = this.files.get(fileName)
      const lineNumbers = document.getElementById(`lines-${fileName}`)
      if (!lineNumbers) return
  
      const lines = file.content.split("\n").length
      let numbersHtml = ""
  
      for (let i = 1; i <= lines; i++) {
        numbersHtml += `${i}\n`
      }
  
      lineNumbers.textContent = numbersHtml
    }
  
    onEditorInput(fileName) {
      const editor = this.editors.get(fileName)
      const file = this.files.get(fileName)
  
      file.content = editor.value
      file.modified = true
  
      this.updateSyntaxHighlighting(fileName)
      this.updateLineNumbers(fileName)
      this.updateTabModifiedState(fileName)
      this.updateStatusBar()
  
      if (this.settings.livePreview) {
        clearTimeout(this.previewTimeout)
        this.previewTimeout = setTimeout(() => this.updatePreview(), 300)
      }
  
      // Add to undo stack
      this.addToUndoStack(fileName, file.content)
    }
  
    onEditorKeyDown(e, fileName) {
      const editor = this.editors.get(fileName)
  
      // Tab key handling
      if (e.key === "Tab") {
        e.preventDefault()
        const start = editor.selectionStart
        const end = editor.selectionEnd
  
        if (e.shiftKey) {
          // Unindent
          const beforeCursor = editor.value.substring(0, start)
          const afterCursor = editor.value.substring(end)
  
          if (beforeCursor.endsWith("    ")) {
            editor.value = beforeCursor.slice(0, -4) + afterCursor
            editor.selectionStart = editor.selectionEnd = start - 4
          }
        } else {
          // Indent
          editor.value = editor.value.substring(0, start) + "    " + editor.value.substring(end)
          editor.selectionStart = editor.selectionEnd = start + 4
        }
  
        this.onEditorInput(fileName)
      }
  
      // Auto-closing brackets and quotes
      const pairs = {
        "(": ")",
        "[": "]",
        "{": "}",
        '"': '"',
        "'": "'",
        "`": "`",
      }
  
      if (pairs[e.key] && editor.selectionStart === editor.selectionEnd) {
        e.preventDefault()
        const start = editor.selectionStart
        const before = editor.value.substring(0, start)
        const after = editor.value.substring(start)
  
        editor.value = before + e.key + pairs[e.key] + after
        editor.selectionStart = editor.selectionEnd = start + 1
        this.onEditorInput(fileName)
      }
    }
  
    updateTabModifiedState(fileName) {
      const tab = document.querySelector(`[data-file="${fileName}"]`)
      const file = this.files.get(fileName)
  
      if (tab) {
        if (file.modified) {
          tab.classList.add("modified")
        } else {
          tab.classList.remove("modified")
        }
      }
    }
  
    switchToFile(fileName) {
      this.activeFile = fileName
  
      // Update tabs
      document.querySelectorAll(".editor-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.file === fileName)
      })
  
      // Update editors
      document.querySelectorAll(".code-editor").forEach((editor) => {
        editor.classList.toggle("active", editor.id === `editor-${fileName}`)
      })
  
      this.updateStatusBar()
    }
  
    closeFile(fileName) {
      const file = this.files.get(fileName)
  
      if (file.modified) {
        if (!confirm(`File "${fileName}" has unsaved changes. Close anyway?`)) {
          return
        }
      }
  
      // Remove tab
      const tab = document.querySelector(`[data-file="${fileName}"]`)
      if (tab) tab.remove()
  
      // Remove editor
      const editor = document.getElementById(`editor-${fileName}`)
      if (editor) editor.remove()
  
      // Remove syntax highlighting
      const highlight = document.getElementById(`highlight-${fileName}`)
      if (highlight) highlight.remove()
  
      // Remove line numbers
      const lineNumbers = document.getElementById(`lines-${fileName}`)
      if (lineNumbers) lineNumbers.remove()
  
      this.editors.delete(fileName)
  
      // Switch to another file if this was active
      if (this.activeFile === fileName) {
        const remainingFiles = Array.from(this.files.keys())
        if (remainingFiles.length > 0) {
          this.switchToFile(remainingFiles[0])
        } else {
          this.activeFile = null
        }
      }
    }
  
    saveCurrentFile() {
      if (!this.activeFile) return
  
      const file = this.files.get(this.activeFile)
      file.modified = false
      file.saved = true
  
      this.updateTabModifiedState(this.activeFile)
      this.saveToLocalStorage()
      this.showNotification(`Saved ${this.activeFile}`, "success")
    }
  
    saveAllFiles() {
      let savedCount = 0
  
      this.files.forEach((file, fileName) => {
        if (file.modified) {
          file.modified = false
          file.saved = true
          this.updateTabModifiedState(fileName)
          savedCount++
        }
      })
  
      this.saveToLocalStorage()
      this.showNotification(`Saved ${savedCount} files`, "success")
    }
  
    autoSave() {
      if (this.activeFile) {
        const file = this.files.get(this.activeFile)
        if (file.modified) {
          this.saveCurrentFile()
        }
      }
    }
  
    saveToLocalStorage() {
      const data = {
        files: Array.from(this.files.entries()),
        activeFile: this.activeFile,
        settings: this.settings,
        theme: this.currentTheme,
      }
  
      localStorage.setItem("advancedCodePlayground", JSON.stringify(data))
    }
  
    loadFromLocalStorage() {
      const saved = localStorage.getItem("advancedCodePlayground")
      if (!saved) return
  
      try {
        const data = JSON.parse(saved)
  
        this.files = new Map(data.files)
        this.activeFile = data.activeFile
        this.settings = { ...this.settings, ...data.settings }
        this.currentTheme = data.theme || "dark"
  
        this.updateFileTree()
        this.setTheme(this.currentTheme)
  
        if (this.activeFile && this.files.has(this.activeFile)) {
          this.openFile(this.activeFile)
        }
      } catch (error) {
        console.error("Failed to load from localStorage:", error)
      }
    }
  
    updateFileTree() {
      const fileTree = document.getElementById("file-tree")
      fileTree.innerHTML = ""
  
      this.files.forEach((file, fileName) => {
        const fileItem = document.createElement("div")
        fileItem.className = "file-item"
        if (fileName === this.activeFile) {
          fileItem.classList.add("active")
        }
        if (file.modified) {
          fileItem.classList.add("modified")
        }
  
        fileItem.innerHTML = `
          <span class="file-icon">${this.getFileIcon(file.type)}</span>
          <span class="file-name">${fileName}</span>
        `
  
        fileItem.addEventListener("click", () => this.openFile(fileName))
        fileTree.appendChild(fileItem)
      })
    }
  
    getFileIcon(type) {
      const icons = {
        html: "🌐",
        css: "🎨",
        javascript: "⚡",
        json: "📋",
        markdown: "📝",
        text: "📄",
      }
      return icons[type] || "📄"
    }
  
    setupPreview() {
      this.updatePreview()
    }
  
    updatePreview() {
      const iframe = document.getElementById("preview-iframe")
      if (!iframe) return
  
      const htmlFile = this.files.get("index.html")
      const cssFile = this.files.get("styles.css")
      const jsFile = this.files.get("script.js")
  
      if (!htmlFile) return
  
      let html = htmlFile.content
  
      // Inject CSS
      if (cssFile) {
        html = html.replace("</head>", `<style>${cssFile.content}</style></head>`)
      }
  
      // Inject JavaScript
      if (jsFile) {
        html = html.replace("</body>", `<script>${jsFile.content}</script></body>`)
      }
  
      iframe.srcdoc = html
      this.updatePerformanceMetrics()
    }
  
    refreshPreview() {
      this.updatePreview()
      this.showNotification("Preview refreshed", "info")
    }
  
    setPreviewDevice(device) {
      const iframe = document.getElementById("preview-iframe")
      const frame = document.getElementById("browser-frame")
  
      const devices = {
        desktop: { width: "100%", height: "100%" },
        tablet: { width: "768px", height: "1024px" },
        mobile: { width: "375px", height: "667px" },
        custom: { width: "100%", height: "100%" },
      }
  
      const deviceConfig = devices[device]
      if (deviceConfig) {
        frame.style.width = deviceConfig.width
        frame.style.height = deviceConfig.height
        frame.style.margin = device === "desktop" ? "8px" : "8px auto"
      }
    }
  
    runCode() {
      this.updatePreview()
      this.showNotification("Code executed successfully!", "success")
      this.addConsoleEntry("Code executed", "log")
    }
  
    formatCode() {
      if (!this.activeFile) return
  
      const file = this.files.get(this.activeFile)
      const editor = this.editors.get(this.activeFile)
  
      let formattedContent = ""
  
      switch (file.type) {
        case "html":
          formattedContent = this.formatHTML(file.content)
          break
        case "css":
          formattedContent = this.formatCSS(file.content)
          break
        case "javascript":
          formattedContent = this.formatJavaScript(file.content)
          break
        default:
          this.showNotification("Formatting not supported for this file type", "warning")
          return
      }
  
      file.content = formattedContent
      editor.value = formattedContent
      file.modified = true
  
      this.updateSyntaxHighlighting(this.activeFile)
      this.updateLineNumbers(this.activeFile)
      this.updateTabModifiedState(this.activeFile)
  
      this.showNotification("Code formatted successfully!", "success")
    }
  
    formatHTML(html) {
      // Simple HTML formatter
      let formatted = html
      let indent = 0
      const indentSize = 4
  
      formatted = formatted.replace(/></g, ">\n<")
  
      const lines = formatted.split("\n")
      const result = []
  
      lines.forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed) return
  
        if (trimmed.startsWith("</")) {
          indent = Math.max(0, indent - indentSize)
        }
  
        result.push(" ".repeat(indent) + trimmed)
  
        if (trimmed.startsWith("<") && !trimmed.startsWith("</") && !trimmed.endsWith("/>")) {
          indent += indentSize
        }
      })
  
      return result.join("\n")
    }
  
    formatCSS(css) {
      // Simple CSS formatter
      return css
        .replace(/\{/g, " {\n    ")
        .replace(/\}/g, "\n}\n")
        .replace(/;/g, ";\n    ")
        .replace(/,/g, ",\n")
        .replace(/\n\s*\n/g, "\n")
        .trim()
    }
  
    formatJavaScript(js) {
      // Simple JavaScript formatter
      let formatted = js
      let indent = 0
      const indentSize = 4
  
      // Add newlines after certain characters
      formatted = formatted.replace(/\{/g, "{\n")
      formatted = formatted.replace(/\}/g, "\n}\n")
      formatted = formatted.replace(/;/g, ";\n")
  
      const lines = formatted.split("\n")
      const result = []
  
      lines.forEach((line) => {
        const trimmed = line.trim()
        if (!trimmed) return
  
        if (trimmed === "}") {
          indent = Math.max(0, indent - indentSize)
        }
  
        result.push(" ".repeat(indent) + trimmed)
  
        if (trimmed.endsWith("{")) {
          indent += indentSize
        }
      })
  
      return result.join("\n")
    }
  
    toggleComment() {
      if (!this.activeFile) return
  
      const editor = this.editors.get(this.activeFile)
      const file = this.files.get(this.activeFile)
      const start = editor.selectionStart
      const end = editor.selectionEnd
  
      const lines = file.content.split("\n")
      const startLine = file.content.substring(0, start).split("\n").length - 1
      const endLine = file.content.substring(0, end).split("\n").length - 1
  
      const commentChars = {
        html: ["<!--", "-->"],
        css: ["/*", "*/"],
        javascript: ["//", ""],
      }
  
      const [commentStart, commentEnd] = commentChars[file.type] || ["//", ""]
  
      for (let i = startLine; i <= endLine; i++) {
        const line = lines[i]
        if (line.trim().startsWith(commentStart)) {
          // Uncomment
          lines[i] = line.replace(commentStart, "").replace(commentEnd, "")
        } else {
          // Comment
          lines[i] = commentStart + line + commentEnd
        }
      }
  
      file.content = lines.join("\n")
      editor.value = file.content
      file.modified = true
  
      this.updateSyntaxHighlighting(this.activeFile)
      this.updateTabModifiedState(this.activeFile)
    }
  
    showFindWidget(showReplace = false) {
      const widget = document.getElementById("find-widget")
      widget.classList.remove("hidden")
  
      const replaceRow = widget.querySelector(".find-row:last-child")
      replaceRow.style.display = showReplace ? "flex" : "none"
  
      document.getElementById("find-input").focus()
    }
  
    hideFindWidget() {
      document.getElementById("find-widget").classList.add("hidden")
    }
  
    performFind(query) {
      if (!this.activeFile || !query) return
  
      const editor = this.editors.get(this.activeFile)
      const content = editor.value.toLowerCase()
      const searchQuery = query.toLowerCase()
  
      const matches = []
      let index = content.indexOf(searchQuery)
  
      while (index !== -1) {
        matches.push(index)
        index = content.indexOf(searchQuery, index + 1)
      }
  
      // Highlight matches (simplified)
      console.log(`Found ${matches.length} matches for "${query}"`)
    }
  
    findNext() {
      // Implementation for finding next match
      console.log("Finding next match...")
    }
  
    findPrevious() {
      // Implementation for finding previous match
      console.log("Finding previous match...")
    }
  
    setupConsole() {
      // Intercept console methods
      const originalLog = console.log
      const originalWarn = console.warn
      const originalError = console.error
  
      console.log = (...args) => {
        originalLog.apply(console, args)
        this.addConsoleEntry(args.join(" "), "log")
      }
  
      console.warn = (...args) => {
        originalWarn.apply(console, args)
        this.addConsoleEntry(args.join(" "), "warn")
      }
  
      console.error = (...args) => {
        originalError.apply(console, args)
        this.addConsoleEntry(args.join(" "), "error")
      }
    }
  
    addConsoleEntry(message, type) {
      const consoleContent = document.getElementById("console-content")
      const entry = document.createElement("div")
      entry.className = `console-entry ${type}`
  
      const icon = type === "log" ? ">" : type === "warn" ? "⚠" : "✕"
  
      entry.innerHTML = `
        <span class="console-icon">${icon}</span>
        <span class="console-message">${message}</span>
      `
  
      consoleContent.appendChild(entry)
      consoleContent.scrollTop = consoleContent.scrollHeight
  
      this.consoleEntries.push({ message, type, timestamp: Date.now() })
    }
  
    executeConsoleCommand(command) {
      this.addConsoleEntry(`> ${command}`, "log")
  
      try {
        const result = eval(command)
        this.addConsoleEntry(String(result), "log")
      } catch (error) {
        this.addConsoleEntry(error.message, "error")
      }
    }
  
    setupTerminal() {
      // Simple terminal simulation
      this.terminalCommands = {
        help: () => "Available commands: help, clear, ls, pwd, echo, date",
        clear: () => {
          document.getElementById("terminal-output").innerHTML = ""
          return ""
        },
        ls: () => Array.from(this.files.keys()).join("  "),
        pwd: () => "/workspace",
        echo: (args) => args.join(" "),
        date: () => new Date().toString(),
      }
    }
  
    executeTerminalCommand(command) {
      const output = document.getElementById("terminal-output")
  
      // Add command to output
      const commandLine = document.createElement("div")
      commandLine.className = "terminal-line"
      commandLine.innerHTML = `
        <span class="terminal-prompt">$</span>
        <span class="terminal-text">${command}</span>
      `
      output.appendChild(commandLine)
  
      // Parse and execute command
      const [cmd, ...args] = command.trim().split(" ")
      const handler = this.terminalCommands[cmd]
  
      let result = ""
      if (handler) {
        result = handler(args)
      } else {
        result = `Command not found: ${cmd}`
      }
  
      if (result) {
        const resultLine = document.createElement("div")
        resultLine.className = "terminal-line"
        resultLine.innerHTML = `<span class="terminal-text">${result}</span>`
        output.appendChild(resultLine)
      }
  
      output.scrollTop = output.scrollHeight
    }
  
    switchSidebarPanel(panel) {
      document.querySelectorAll(".sidebar-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.panel === panel)
      })
  
      document.querySelectorAll(".sidebar-panel").forEach((p) => {
        p.classList.toggle("active", p.id === `${panel}-panel`)
      })
    }
  
    switchPreviewPanel(panel) {
      document.querySelectorAll(".preview-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.preview === panel)
      })
  
      document.querySelectorAll(".preview-panel").forEach((p) => {
        p.classList.toggle("active", p.id === `${panel}-preview`)
      })
    }
  
    switchBottomPanel(panel) {
      document.querySelectorAll(".bottom-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.bottom === panel)
      })
  
      document.querySelectorAll(".bottom-panel-content").forEach((p) => {
        p.classList.toggle("active", p.id === `${panel}-content`)
      })
    }
  
    showCommandPalette() {
      const palette = document.getElementById("command-palette")
      palette.classList.remove("hidden")
      document.getElementById("command-input").focus()
  
      // Populate commands
      this.populateCommands()
    }
  
    hideCommandPalette() {
      document.getElementById("command-palette").classList.add("hidden")
    }
  
    populateCommands() {
      const commands = [
        { name: "New File", action: () => this.createNewFile(), shortcut: "Ctrl+N" },
        { name: "Save File", action: () => this.saveCurrentFile(), shortcut: "Ctrl+S" },
        { name: "Save All", action: () => this.saveAllFiles(), shortcut: "Ctrl+Shift+S" },
        { name: "Format Code", action: () => this.formatCode(), shortcut: "Shift+Alt+F" },
        { name: "Run Code", action: () => this.runCode(), shortcut: "F5" },
        { name: "Toggle Comment", action: () => this.toggleComment(), shortcut: "Ctrl+/" },
        { name: "Find", action: () => this.showFindWidget(), shortcut: "Ctrl+F" },
        { name: "Replace", action: () => this.showFindWidget(true), shortcut: "Ctrl+H" },
        { name: "Settings", action: () => this.showSettings(), shortcut: "" },
      ]
  
      const commandList = document.getElementById("command-list")
      commandList.innerHTML = ""
  
      commands.forEach((cmd) => {
        const item = document.createElement("div")
        item.className = "command-item"
        item.innerHTML = `
          <span class="command-icon">⚡</span>
          <span class="command-text">${cmd.name}</span>
          <span class="command-shortcut">${cmd.shortcut}</span>
        `
  
        item.addEventListener("click", () => {
          cmd.action()
          this.hideCommandPalette()
        })
  
        commandList.appendChild(item)
      })
    }
  
    showContextMenu(e) {
      e.preventDefault()
      const menu = document.getElementById("context-menu")
  
      menu.innerHTML = `
        <div class="context-menu-item" onclick="playground.createNewFile()">New File</div>
        <div class="context-menu-item" onclick="playground.saveCurrentFile()">Save</div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" onclick="playground.formatCode()">Format Code</div>
        <div class="context-menu-item" onclick="playground.toggleComment()">Toggle Comment</div>
        <div class="context-menu-separator"></div>
        <div class="context-menu-item" onclick="playground.showFindWidget()">Find</div>
        <div class="context-menu-item" onclick="playground.showFindWidget(true)">Replace</div>
      `
  
      menu.style.left = e.pageX + "px"
      menu.style.top = e.pageY + "px"
      menu.classList.remove("hidden")
    }
  
    hideContextMenu() {
      document.getElementById("context-menu").classList.add("hidden")
    }
  
    showSettings() {
      document.getElementById("modal-overlay").classList.remove("hidden")
      this.populateSettings()
    }
  
    populateSettings() {
      const settingsContent = document.querySelector(".settings-content")
      settingsContent.innerHTML = `
        <div class="setting-group">
          <h3>Editor</h3>
          <div class="setting-item">
            <div class="setting-label">
              <h4>Font Size</h4>
              <p>Controls the font size in the editor</p>
            </div>
            <div class="setting-control">
              <input type="number" value="${this.settings.fontSize}" min="10" max="24" 
                     onchange="playground.updateSetting('fontSize', this.value)">
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <h4>Tab Size</h4>
              <p>Number of spaces for indentation</p>
            </div>
            <div class="setting-control">
              <input type="number" value="${this.settings.tabSize}" min="2" max="8" 
                     onchange="playground.updateSetting('tabSize', this.value)">
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <h4>Word Wrap</h4>
              <p>Enable word wrapping in the editor</p>
            </div>
            <div class="setting-control">
              <input type="checkbox" ${this.settings.wordWrap ? "checked" : ""} 
                     onchange="playground.updateSetting('wordWrap', this.checked)">
            </div>
          </div>
        </div>
        
        <div class="setting-group">
          <h3>Features</h3>
          <div class="setting-item">
            <div class="setting-label">
              <h4>Auto Save</h4>
              <p>Automatically save files every 30 seconds</p>
            </div>
            <div class="setting-control">
              <input type="checkbox" ${this.settings.autoSave ? "checked" : ""} 
                     onchange="playground.updateSetting('autoSave', this.checked)">
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-label">
              <h4>Live Preview</h4>
              <p>Update preview as you type</p>
            </div>
            <div class="setting-control">
              <input type="checkbox" ${this.settings.livePreview ? "checked" : ""} 
                     onchange="playground.updateSetting('livePreview', this.checked)">
            </div>
          </div>
        </div>
      `
    }
  
    updateSetting(key, value) {
      this.settings[key] = value
      this.saveToLocalStorage()
      this.showNotification(`Setting updated: ${key}`, "success")
    }
  
    setupResizers() {
      const sidebarResizer = document.getElementById("sidebar-resizer")
      const editorResizer = document.getElementById("editor-resizer")
  
      this.setupResizer(sidebarResizer, "sidebar", "horizontal")
      this.setupResizer(editorResizer, "preview-area", "horizontal")
    }
  
    setupResizer(resizer, targetClass, direction) {
      let isResizing = false
  
      resizer.addEventListener("mousedown", (e) => {
        isResizing = true
        document.addEventListener("mousemove", handleResize)
        document.addEventListener("mouseup", stopResize)
        e.preventDefault()
      })
  
      const handleResize = (e) => {
        if (!isResizing) return
  
        const container = document.querySelector(".main-content")
        const rect = container.getBoundingClientRect()
  
        if (direction === "horizontal") {
          const percentage = ((e.clientX - rect.left) / rect.width) * 100
          if (percentage > 15 && percentage < 85) {
            if (targetClass === "sidebar") {
              document.querySelector(".sidebar").style.width = percentage + "%"
            } else {
              document.querySelector(".preview-area").style.width = 100 - percentage + "%"
            }
          }
        }
      }
  
      const stopResize = () => {
        isResizing = false
        document.removeEventListener("mousemove", handleResize)
        document.removeEventListener("mouseup", stopResize)
      }
    }
  
    updateStatusBar() {
      if (!this.activeFile) return
  
      const editor = this.editors.get(this.activeFile)
      const file = this.files.get(this.activeFile)
  
      if (editor) {
        const lines = editor.value.split("\n")
        const currentLine = editor.value.substring(0, editor.selectionStart).split("\n").length
        const currentCol = editor.selectionStart - editor.value.lastIndexOf("\n", editor.selectionStart - 1)
  
        document.getElementById("cursor-position").textContent = `Ln ${currentLine}, Col ${currentCol}`
        document.getElementById("file-type").textContent = file.type.toUpperCase()
      }
    }
  
    updatePerformanceMetrics() {
      // Simulate performance metrics
      this.performanceMetrics.loadTime = Math.random() * 1000 + 500
      this.performanceMetrics.domNodes = Math.floor(Math.random() * 100) + 50
      this.performanceMetrics.memoryUsage = Math.random() * 10 + 5
      this.performanceMetrics.bundleSize = Math.random() * 500 + 100
  
      document.getElementById("load-time").textContent = Math.round(this.performanceMetrics.loadTime) + "ms"
      document.getElementById("dom-nodes").textContent = this.performanceMetrics.domNodes
      document.getElementById("memory-usage").textContent = this.performanceMetrics.memoryUsage.toFixed(1) + "MB"
      document.getElementById("bundle-size").textContent = Math.round(this.performanceMetrics.bundleSize) + "KB"
    }
  
    updateMinimap() {
      // Simplified minimap implementation
      const canvas = document.getElementById("minimap-canvas")
      if (!canvas || !this.activeFile) return
  
      const ctx = canvas.getContext("2d")
      const editor = this.editors.get(this.activeFile)
  
      canvas.width = 120
      canvas.height = 200
  
      ctx.fillStyle = "#2d2d2d"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
  
      // Draw simplified code representation
      const lines = editor.value.split("\n")
      const lineHeight = canvas.height / Math.max(lines.length, 1)
  
      lines.forEach((line, index) => {
        if (line.trim()) {
          ctx.fillStyle = "#569cd6"
          ctx.fillRect(5, index * lineHeight, Math.min(line.length * 2, canvas.width - 10), Math.max(lineHeight - 1, 1))
        }
      })
    }
  
    showNotification(message, type = "info") {
      const container = document.getElementById("notifications-container")
      const notification = document.createElement("div")
      notification.className = `notification ${type}`
  
      const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
      }
  
      notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <div class="notification-content">
          <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
          <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentNode.remove()">×</button>
      `
  
      container.appendChild(notification)
  
      // Auto remove after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove()
        }
      }, 5000)
  
      this.notifications.push({ message, type, timestamp: Date.now() })
    }
  
    addToUndoStack(fileName, content) {
      if (!this.undoStack[fileName]) {
        this.undoStack[fileName] = []
      }
  
      this.undoStack[fileName].push(content)
  
      // Limit undo stack size
      if (this.undoStack[fileName].length > 50) {
        this.undoStack[fileName].shift()
      }
  
      // Clear redo stack
      this.redoStack[fileName] = []
    }
  
    undo() {
      if (!this.activeFile || !this.undoStack[this.activeFile] || this.undoStack[this.activeFile].length === 0) {
        return
      }
  
      const file = this.files.get(this.activeFile)
      const editor = this.editors.get(this.activeFile)
  
      // Add current state to redo stack
      if (!this.redoStack[this.activeFile]) {
        this.redoStack[this.activeFile] = []
      }
      this.redoStack[this.activeFile].push(file.content)
  
      // Restore previous state
      const previousContent = this.undoStack[this.activeFile].pop()
      file.content = previousContent
      editor.value = previousContent
  
      this.updateSyntaxHighlighting(this.activeFile)
      this.updateLineNumbers(this.activeFile)
    }
  
    redo() {
      if (!this.activeFile || !this.redoStack[this.activeFile] || this.redoStack[this.activeFile].length === 0) {
        return
      }
  
      const file = this.files.get(this.activeFile)
      const editor = this.editors.get(this.activeFile)
  
      // Add current state to undo stack
      this.undoStack[this.activeFile].push(file.content)
  
      // Restore next state
      const nextContent = this.redoStack[this.activeFile].pop()
      file.content = nextContent
      editor.value = nextContent
  
      this.updateSyntaxHighlighting(this.activeFile)
      this.updateLineNumbers(this.activeFile)
    }
  
    debugCode() {
      this.showNotification("Debug mode activated", "info")
      this.addConsoleEntry("Debug session started", "log")
    }
  
    toggleFullscreenPreview() {
      const previewArea = document.querySelector(".preview-area")
      const editorArea = document.querySelector(".editor-area")
      const sidebar = document.querySelector(".sidebar")
  
      if (previewArea.classList.contains("fullscreen")) {
        previewArea.classList.remove("fullscreen")
        editorArea.style.display = "flex"
        sidebar.style.display = "flex"
        previewArea.style.width = "400px"
      } else {
        previewArea.classList.add("fullscreen")
        editorArea.style.display = "none"
        sidebar.style.display = "none"
        previewArea.style.width = "100%"
      }
    }
  }
  
  // Initialize the playground
  let playground
  
  document.addEventListener("DOMContentLoaded", () => {
    playground = new AdvancedCodePlayground()
  
    // Load saved data
    playground.loadFromLocalStorage()
  
    // Setup close modal handlers
    document.getElementById("close-settings").addEventListener("click", () => {
      document.getElementById("modal-overlay").classList.add("hidden")
    })
  
    document.getElementById("modal-overlay").addEventListener("click", (e) => {
      if (e.target === e.currentTarget) {
        document.getElementById("modal-overlay").classList.add("hidden")
      }
    })
  })
  
  // Global error handling
  window.addEventListener("error", (e) => {
    playground?.addConsoleEntry(`Error: ${e.message}`, "error")
  })
  
  window.addEventListener("unhandledrejection", (e) => {
    playground?.addConsoleEntry(`Unhandled Promise Rejection: ${e.reason}`, "error")
  })
  