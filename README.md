# Chat with Paper

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)
[![Using Zotero Plugin Template](https://img.shields.io/badge/Using-Zotero%20Plugin%20Template-blue?style=flat-square&logo=github)](https://github.com/windingwind/zotero-plugin-template)

### Main features

Features about Chat with Paper:

- 💬 Ask ChatGPT questions while reading a paper!
- 📚 Supports multiple languages, including English and Korean (Languages other than English may be slower).
- ✨ Better understanding with ChatGPT: Only supports `gpt-4o`
- ⭐️ Compatible with only `Zotero 7`

![zotero plugin demo](/demo/demo-eng.png)

### How to use

- Download `chat-with-paper.xpi` file [[link]](https://github.com/givemetarte/chat-with-paper/releases/tag/pre-release)
- Install `.xpi` file in Zotero (drag to Plugins Manager)
- Open Settings > Chat with Paper
- Register your OpenAI API key and Enter!
  ![settings](/demo/preferences.png)

### RAG-based response generation pipeline

- 💬 Simple RAG based LLM chatbot!
  1. Extract text from Paper with [Zotero API](https://www.zotero.org/support/dev/client_coding/javascript_api)
  2. Split text into chunks (chunk size: 1024, overlaps: 200)
  3. Generate embeddings with `text-embedding-3-large`
  4. Retrieve relevant information for the user's question
  5. Provide context to ChatGPT prompt with `gpt-4o`
  6. Generate a response!

### Future tasks

👀 Anyone is welcome to participate!

- [ ] Encrypt and store API keys
- [ ] Support language models other than ChatGPT (Claude-sonnet..., etc)
- [ ] Refactor code based on LangChain
- [ ] Refactor code based on LangChain
- [ ] Generate responses reflecting past conversations
