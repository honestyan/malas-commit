# malas-commit 🚀

[![npm version](https://img.shields.io/npm/v/malas-commit.svg)](https://www.npmjs.com/package/malas-commit)
[![npm downloads](https://img.shields.io/npm/dt/malas-commit.svg)](https://www.npmjs.com/package/malas-commit)
[![License](https://img.shields.io/npm/l/malas-commit.svg)](https://github.com/honestyan/malas-commit/blob/main/LICENSE)

**malas-commit**: Your savior when you're too lazy to write commit messages! Automatically generate meaningful commit messages with ease. (Fastest NPM package for generating meaningful commit messages using Groq API)

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

- **Easy Configuration**: Quickly set up and get started with your API key and preferred configuration.
- **Automated Commit Messages**: No more thinking about commit messages! Generate them instantly.
- **Global Installation**: Install once, use everywhere.
- **Simple Command**: Generate messages with a single command.

## Requirement

You should have a GROQ_APIKEY (for free, just sign up).

You can obtain it from [GROQ Console](https://console.groq.com/keys).

---

## Installation

To install the package globally, run the following command:

```bash
npm i malas-commit -g

```

Set GROQ_APIKEY:

```bash

malas setConfig GROQ_APIKEY <your-groq-apikey>

```

## How to use

```bash

malas

```

OR

```bash

malas-commit

```

## Configuration

You can configure **malas-commit** by creating a `~/.malas-commit.json` file in the home_dir. Here is an example configuration:

```json
{
  "GROQ_APIKEY": "<your-groq-apikey>",
  "COMMIT_PROMPT": "<your-custom-promt>" // Leave it blank if you use default prompt instead
}
```

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

Special thanks to all the contributors and the open-source community for their support.
