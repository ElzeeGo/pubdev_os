module.exports = {
  "apiUrl": "https://pubdev.app", // or http://localhost:3000 for local development
  "apiKey": "your_api_key_here",  
  "projectId": "your_project_id_here",
  "scan": {
    "paths": [
      "app",
      "components",
      "lib"
    ],
    "ignore": [
      "**/*.test.tsx",
      "**/*.test.ts",
      "**/*.stories.tsx",
      "**/*.spec.tsx"
    ]
  },
  "triggers": {
    "onBuild": true,
    "onCommit": false,
    "onPush": false
  }
}

