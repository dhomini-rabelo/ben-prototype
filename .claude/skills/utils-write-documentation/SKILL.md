---
name: utils-write-documentation
description: This skill focuses on best practices for writing clear and effective documentation for AI agents to understand and work with software projects efficiently. Use whenever you need to create documentation for a project, a feature, or a specific aspect of the codebase.
disable-model-invocation: true
---

# Writing Documentation Skill

## Overview

Creating clear and effective documentation is essential for ensuring that AI agents can understand project efficiently. This skill focuses on best practices for writing documentation that is both comprehensive and easy to follow.

## The default conventions to follow in any documentation

1. Always create markdown files (`edit/createFile` tool) for documentation.
2. Always write a very concise text avoiding using too many subjects in the same documentation.
3. Use subheadings (`##`, `###`, etc.) to organize content into sections and subsections.
4. Use bullet points or numbered lists to break down complex information into digestible parts.
    1. Use numbered lists for sequential steps, long lists, nested lists, or when order matters.
    2. Use bullet points for non-sequential information.
5. Use nested lists for hierarchical information.
6. Use **bold** text to highlight important terms or concepts.
7. To show code snippets, use triple backticks (```) before and after the code block. Specify the language for syntax highlighting (e.g., ```py, ```js).
8. Use '`edit/createFile`  to highlight a tool name, file path, or any specific term related to the project.
   1. When referencing other documentation files, provide relative paths to ensure easy navigation.
9. Try to provide examples so that the reader can understand better.
10. Break lines between sections, titles, and paragraphs to improve readability.
11. Maintain a consistent tone and style throughout the documentation to ensure readability.
