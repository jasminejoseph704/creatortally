# Contributing to Creator Tally

Thank you for your interest in contributing to Creator Tally! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
1. Search existing issues to avoid duplicates
2. Create a detailed issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and version information

### Suggesting Features

We welcome feature suggestions! Please:
1. Search existing issues first
2. Describe the problem you're trying to solve
3. Explain how your proposed feature would help
4. Provide examples if possible

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
   - Follow the existing code style
   - Comment your code where necessary
   - Test your changes thoroughly
4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of changes"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request**
   - Fill out the PR template
   - Link any related issues

## Development Guidelines

### Code Style
- Use semantic HTML
- Follow CSS custom properties pattern (see `:root` in index.html)
- Write vanilla JavaScript (no frameworks)
- Use meaningful variable and function names
- Add comments for complex logic

### File Structure
```
creatortally/
├── index.html          # Main application
├── privacy.html        # Privacy policy page
├── terms.html          # Terms of service page
├── cookies.html        # Cookie policy page
├── 404.html            # Error page
├── favicon.svg         # Favicon
└── [other files]       # Supporting documentation
```

### Testing
- Test your changes in multiple browsers
- Test on mobile and desktop
- Ensure no console errors
- Verify all interactive elements work

### Performance
- Keep page weight minimal
- Use efficient CSS selectors
- Avoid layout shifts
- Optimize images if added

## Questions?

Feel free to:
- Open an issue for questions
- Join our community discussion
- Email us at support@creatortally.app

## Recognition

Contributors will be recognized in our README and release notes.

Thank you for making Creator Tally better! 🎉