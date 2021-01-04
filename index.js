const core = require("@actions/core");
const github = require("@actions/github");
const { exec, execSync } = require("child_process");
const path = require("path");
var fs = require("fs");

try {
  const output = core.getInput("output");
  const outputFormat = core.getInput("outputFormat");
  const testProject = core.getInput("testProject");
  let excludestring = core.getInput("excludes");
  let includestring = core.getInput("excludes");
  

  /****************************************/
  /****                                ****/
  /****  create coverlet args          ****/
  /****                                ****/
  /****************************************/

  console.log("create coverlet args");

  let msbuild = `/p:coverletOutput=${output} -p:CollectCoverage=true -p:CoverletOutputFormat=${outputFormat}`;
  if (excludestring !== null && excludestring !== undefined) {
    msbuild += ` -p:Exclude=\\"${excludestring}\\"`;
    console.log(`found exclusions ${excludestring}`);    
  }
  msbuild += ` ${testProject}`;

  console.log(`coverlet args ${msbuild}`);

  /* ***************************************/
  /* ***                                ****/
  /* ***  run dotnet test               ****/
  /* ***                                ****/
  /* ***************************************/

  console.log("run dotnet test");

  var dotnet = execSync(`dotnet test -c Debug ${msbuild}`);
  console.log(dotnet.toString());

  /****************************************/
  /****                                ****/
  /****  delete msbuild.rsp            ****/
  /****  set coverageFile output       ****/
  /****                                ****/
  /****************************************/

  const testPath = path.dirname(testProject);
  const coverageFile = `${testPath}/${output}`;

  if (fs.existsSync(coverageFile)) {
    console.log("[1] coverage file created at " + coverageFile);
  } else {
    core.setFailed(
      `error occured : coverage file not found at ${coverageFile}`
    );
    console.log("[1]covergae file not found at " + coverageFile);
  }

  console.log(`setting output coverageFile : >>${coverageFile}<<`);
  core.setOutput("coverageFile", coverageFile);

  console.log("coverlet test done.");
} catch (error) {
  console.log('global error '+error);
  core.setFailed(error.message);
}
