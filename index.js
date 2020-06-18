index.js

const core = require('@actions/core');
const github = require('@actions/github');

try {
  // `who-to-greet` input defined in action metadata file
  const output = core.getInput('output');
  console.log(`output ${output}!`);
  const outputFormat = core.getInput('outputFormat');
  console.log(`output ${outputFormat}!`);
  const testProject = core.getInput('testProject');
  console.log(`output ${testProject}!`);

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}