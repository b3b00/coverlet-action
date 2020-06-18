const core = require("@actions/core");
const github = require("@actions/github");
const { exec, execSync } = require("child_process");
const path = require("path");
var fs = require("fs");

try {
  const output = core.getInput("output");
  const outputFormat = core.getInput("outputFormat");
  const testProject = core.getInput("testProject");
  const excludes = core.getInput("excludes");

  /****************************************/
  /****                                ****/
  /****  create msbuild.rsp file       ****/
  /****                                ****/
  /****************************************/

  console.log("create msbuild.rsp file");

  let msbuild = `/p:coverletOutput=${output} /p:CollectCoverage=true /p:CoverletOutputFormat=${outputFormat}`;
  if (excludes !== null && excludes !== undefined) {
    msbuild += ` /p:exclude="${excludes}"`;
  }
  msbuild += ` ${testProject}`;

  fs.writeFileSync("msbuild.rsp", msbuild);
  console.log(`msbuid.rsp conf :: ${msbuild}`);

  /* ***************************************/
  /* ***                                ****/
  /* ***  run dotnet test               ****/
  /* ***                                ****/
  /* ***************************************/

  console.log("run dotnet test");

  var dotnet = execSync("dotnet test -c Debug");
  console.log(dotnet.toString());

  /****************************************/
  /****                                ****/
  /****  delete msbuild.rsp            ****/
  /****  set coverageFile output       ****/
  /****                                ****/
  /****************************************/

  const testPath = path.dirname(testProject);
  const coverageFile = `${testPath}/${output}`;

  console.log(
    `delete msbuild.rsp and set coverageFile output : ${coverageFile}`
  );

  if (fs.existsSync("msbuild.rsp")) {
    if (fs.existsSync(coverageFile)) {
      console.log("[1] coverage file created at " + coverageFile);
    }
    core.setOutput("coverageFile", coverageFile);
    fs.unlinkSync("msbuild.rsp");
  } else {
    if (fs.existsSync(coverageFile)) {
      console.log("[2] coverage file created at " + coverageFile);
    }
    core.setFailed(`unable to find coverage file ${coverageFile}`);
  }

  if (fs.existsSync(coverageFile)) {
    console.log("[3] coverage file created at " + coverageFile);
  }
} catch (error) {
  if (fs.existsSync("msbuild.rsp")) {
    core.setFailed(`error occured : ${error}`);
    fs.unlinkSync("msbuild.rsp");
  }
  core.setFailed(error.message);
}
