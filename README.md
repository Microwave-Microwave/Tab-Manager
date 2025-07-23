# Tab-Manager

A simple Chrome extension for organizing and managing your open tabs by category.

---

### 🔧 Custom Grouping

You can customize how your tabs are grouped by editing the `sortingRules` object in `popup.js` (line 15).  
Example:

```js
const sortingRules = {
    "Media": ["youtube", "netflix", "twitch", "spotify", "vimeo", "hulu", "disney"],
    "Development": ["github", "stackoverflow", "codepen", "replit", "codesandbox", "jsfiddle", "gitlab"],
    "Communication": ["gmail", "outlook", "slack", "discord", "teams", "zoom", "telegram"],
    "Social": ["facebook", "twitter", "instagram", "linkedin", "reddit", "tiktok"],
    "Shopping": ["amazon", "ebay", "etsy", "shopify", "alibaba", "walmart"],
    "News": ["cnn", "bbc", "reuters", "nytimes", "reddit", "hackernews"],
    "Productivity": ["notion", "trello", "asana", "monday", "clickup", "todoist"]
};

💾 Save Your Custom Groups
Once you've made changes to the sortingRules, you can generate a string to save or share your personalized group configuration.
