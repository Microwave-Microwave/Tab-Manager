# Tab-Manager
Chrome extension for tab management.

popup.js line 15 has a json field you can edit for your own website groupings.

Looks like this:
const sortingRules = {
        "Media": ["youtube", "netflix", "twitch", "spotify", "vimeo", "hulu", "disney"],
        "Development": ["github", "stackoverflow", "codepen", "replit", "codesandbox", "jsfiddle", "gitlab"],
        "Communication": ["gmail", "outlook", "slack", "discord", "teams", "zoom", "telegram"],
        "Social": ["facebook", "twitter", "instagram", "linkedin", "reddit", "tiktok"],
        "Shopping": ["amazon", "ebay", "etsy", "shopify", "alibaba", "walmart"],
        "News": ["cnn", "bbc", "reuters", "nytimes", "reddit", "hackernews"],
        "Productivity": ["notion", "trello", "asana", "monday", "clickup", "todoist"]
    };

You can generate a string to save your added groups.
