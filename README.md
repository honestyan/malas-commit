# malas-commit 🚀

[![npm version](https://img.shields.io/npm/v/malas-commit.svg)](https://www.npmjs.com/package/malas-commit)
[![npm downloads](https://img.shields.io/npm/dt/malas-commit.svg)](https://www.npmjs.com/package/malas-commit)
[![License](https://img.shields.io/npm/l/malas-commit.svg)](https://github.com/honestyan/malas-commit/blob/main/LICENSE)

**malas-commit**: The ultimate tool for developers who need automated, meaningful commit messages without the hassle! This fast and efficient NPM package uses AI (Groq or Gemini) to generate smart, context-aware commit messages in seconds. With automatic fallback support, you get reliable generation even when one API has issues. Perfect for boosting productivity in your Git workflows.

<p align="center">
  <img src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjRtOWxpYjFyYTlvb3F3Z3dxejViaWpib3Frdzlwb3VyOG94OTQ4eSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PklUQkgci2ogb3vPZp/giphy.gif" alt="malas-commit">
</p>

<p align="center">
    <img src="https://github.com/user-attachments/assets/de54b650-e7c4-472a-9a46-edf8c7ca678e" alt="images">
</p>

## Why Malas Commit?

The word _malas_ in Indonesian means **lazy**. Often, developers feel lazy or lack motivation to come up with commit messages that are both clear and concise. **Malas Commit** automates this task for you!

### Definition of "Malas":

1. **Indonesian (ma.las)**:
   - a. Not willing to work on something: _orang yang malas itu lebih senang mengemis daripada bekerja_ (The lazy person prefers begging to working).
   - a. Not eager or reluctant to do something: _malas rasanya mengunjungi rapat seperti itu_ (feeling too lazy to attend such a meeting).

## Features

- 🤖 **Dual AI Support**: Use Groq or Gemini APIs (or both with automatic fallback)
- 🔄 **Automatic Fallback**: If Groq fails, automatically switches to Gemini
- 📏 **Smart Context Limits**: Dynamic diff limits based on API (200K chars for Gemini, 20K for Groq)
- ⚡ **Easy Configuration**: Quickly set up and get started with your API key
- 📝 **Automated Commit Messages**: No more thinking about commit messages! Generate them instantly
- 🌍 **Global Installation**: Install once, use everywhere
- 🎯 **Simple Command**: Generate messages with a single command

## Requirements

You need at least ONE of the following API keys (both are free!):

### Option 1: Groq API (Recommended for speed)
- Sign up at [Groq Console](https://console.groq.com/keys)
- Fast inference with Llama models
- Free tier: ~32K token context

### Option 2: Gemini API (Recommended for large diffs)
- Get your key from [Google AI Studio](https://aistudio.google.com/apikey)
- Supports much larger context (up to 1M tokens)
- Free tier: 1,500 requests/day

### Option 3: Both APIs (Best reliability)
- Configure both for automatic fallback
- Groq is tried first, Gemini as backup
- Maximum reliability and uptime

**Node.js**: Version 16.0.1 or higher

---

## Installation

To install the package globally, run the following command:

```bash
npm i malas-commit -g
```

### Configuration

**Option 1: Groq only (fast)**
```bash
malas setConfig GROQ_APIKEY <your-groq-apikey>
```

**Option 2: Gemini only (large context)**
```bash
malas setConfig GEMINI_APIKEY <your-gemini-apikey>
```

**Option 3: Both (automatic fallback)**
```bash
malas setConfig GROQ_APIKEY <your-groq-apikey>
malas setConfig GEMINI_APIKEY <your-gemini-apikey>
```

## How to use

```bash

malas

```

OR

```bash

mls

```

## Generate Pull Request Title and Description

To generate a pull request title and description in Markdown format (without pushing your changes), use the following command:

```bash
malas pr
```

## Advanced Configuration

You can configure **malas-commit** by editing the `~/.malas-commit` file. Example configuration:

```json
{
  "GROQ_APIKEY": "<your-groq-apikey>",
  "GEMINI_APIKEY": "<your-gemini-apikey>",
  "COMMIT_PROMPT": "<your-custom-prompt>" // Leave blank to use default
}
```

### How Fallback Works

1. **Groq First**: If `GROQ_APIKEY` is set, Groq is tried first
2. **Gemini Fallback**: If Groq fails and `GEMINI_APIKEY` is set, automatically switches to Gemini
3. **Gemini Only**: If only `GEMINI_APIKEY` is set, uses Gemini directly
4. **Error**: If no API keys are configured, shows an error

### Dynamic Context Limits

The diff character limit automatically adjusts based on your configuration:
- **Gemini only**: 200,000 characters (10x larger!)
- **Groq or Both**: 20,000 characters (safe for Groq)

This means with Gemini, you can process much larger codebases without truncation!

## To-Do List

- [x] Fix the bug where the process still runs after selecting "no" in the yes/no prompt.
- [x] Implement error handling for failed network requests.
- [ ] Refactor the code for better readability.
- [ ] Write unit tests for the new features.
- [x] Add an auto-generated pull request description generator related to changes using Markdown format code.
- [x] Migrate to semantic commit. ([Semantic Commit Guide](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716))

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Special thanks to all the contributors and the open-source community for their support.
