# 🚀 DevLens

## 🤖 RAG-Powered AI Code & Documentation Assistant

🌐 **Live Demo:** https://rag-dev-lens.vercel.app/

DevLens is a **RAG-powered AI Code & Documentation Assistant** that helps developers understand, explore, and interact with their codebases using natural language.

Developers can upload **source code, documentation, files, or complete project folders** and ask questions about their projects. DevLens retrieves the most relevant information from the uploaded project and uses it as context to generate accurate, project-specific AI responses.

---

## ✨ Features

### 🔐 Authentication

- 👤 User registration
- 🔑 User login
- 🎫 JWT-based authentication
- 🛡️ Protected routes
- 🔒 Secure password handling
- 🚪 Logout functionality

### 📁 Project Management

- ➕ Create projects
- 📋 View projects
- 🔍 View project details
- 🗂️ Project-based document management
- 💬 Project-based conversations
- 🗑️ Project management

### 📤 File & Folder Upload

- 📄 Upload individual files
- 📚 Upload multiple files
- 📂 Upload complete project folders
- 📦 Process project source code and documentation
- 🗑️ Delete uploaded documents
- 📊 Track document processing

### 🧠 AI & RAG

- 🔎 Semantic search
- 🧩 Document chunking
- 🧠 Embedding generation
- 🔮 Vector similarity search
- 📚 Relevant context retrieval
- 🤖 Retrieval-Augmented Generation
- 💬 Project-aware AI responses
- 🗣️ Conversation-aware responses

### 🗄️ Data & Storage

- 🐘 PostgreSQL database
- 🔮 Qdrant vector database
- 📑 Document metadata storage
- 💾 Conversation persistence
- 📨 Message persistence

### 🎨 Developer Experience

- 📊 Developer dashboard
- 🗃️ Project workspace
- 📄 Document management
- 💬 AI chat interface
- 🎨 Modern responsive UI
- 🧩 Reusable UI components
- 📖 Swagger API documentation

### 🚀 Deployment

- 🐳 Docker support
- ☁️ Cloud deployment
- 🌐 Frontend deployment
- ⚙️ Containerized backend deployment
- ❤️ Health-check endpoints
- 🔐 Environment-based configuration

---

# 💡 Why DevLens?

Understanding an unfamiliar codebase can be difficult and time-consuming.

Developers usually need to:

- 🔍 Search through multiple files
- 📖 Read project documentation
- 🧩 Understand project architecture
- 🔐 Find authentication logic
- 🗄️ Understand database interactions
- 🔎 Locate specific functions
- 🔗 Trace API requests
- 🧠 Understand how different services communicate

DevLens provides a conversational interface where developers can simply ask questions about their project.

For example:

> 💬 **"How does authentication work in this project?"**

DevLens retrieves the relevant files and code chunks and generates an answer based on the actual project context.

---

# 🧠 Why RAG?

A general-purpose LLM does not automatically know the contents of a developer's private codebase.

Sending an entire project to an LLM for every question is also inefficient because:

- 📦 Large projects may exceed context limits
- 💰 It increases API costs
- ⏱️ It increases response latency
- 🎯 Irrelevant files may be included
- 🧠 Important information can get lost in a large context

DevLens solves this using **Retrieval-Augmented Generation (RAG)**.

Instead of sending the entire project to the LLM, DevLens retrieves only the most relevant information.

```text
👨‍💻 User Question
        ↓
🧠 Query Embedding
        ↓
🔎 Vector Search
        ↓
📚 Relevant Project Chunks
        ↓
📝 Context Construction
        ↓
🤖 LLM
        ↓
💬 Project-Specific Answer
