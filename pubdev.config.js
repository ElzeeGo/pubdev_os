module.exports = {
  "apiUrl": "https://pubdev.app", // Local development server
  "apiKey": "sk_632387a122187b3ae6982c49b7dc28f642b7a4f30d5229a96ca7eb669cb10913",  
  "projectId": "e5bda21c-3f9b-48ae-9f45-454627c861b2",
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