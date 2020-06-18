const core = require('@actions/core');
const github = require('@actions/github');
const { exec, execSync } = require("child_process");
const path = require('path');
var fs = require('fs');

try {
  // `who-to-greet` input defined in action metadata file
  const output = core.getInput('output');
  console.log(`output ${output}`);
  const outputFormat = core.getInput('outputFormat');
  console.log(`output ${outputFormat}`);
  const testProject = core.getInput('testProject');
  console.log(`output ${testProject}`);
  const excludes = core.getInput('excludes');
  console.log(`excludes ${excludes}`);

/****************************************/
/****                                ****/
/****  create msbuild.rsp file       ****/
/****                                ****/
/****************************************/

let msbuild = `/p:coverletOutput=${output} /p:CollectCoverage=true /p:CoverletOutputFormat=${outputFormat}`
if (excludes !== null && excludes !== undefined) {
    msbuild += ` /:exclude="${excludes}"`;    
}
msbuild += ` ${testProject}`

fs.writeFileSync('msbuild.rsp',msbuild);



/* ***************************************/
/* ***                                ****/
/* ***  run dotnet test               ****/
/* ***                                ****/
/* ***************************************/

var ls = execSync('ls -la');
console.log(ls.toString());

var dotnet = execSync('dotnet test -c Debug');
console.log(dotnet.toString());

/****************************************/
/****                                ****/
/****  delete msbuild.rsp            ****/
/****  set coverageFile output       ****/
/****                                ****/
/****************************************/

    if (fs.existsSync('msbuild.rsp')) {
        core.setOutput("coverageFile", `${path.dirName(testProject)}${path.delimiter}${testProject}\${output}` );
        fs.unlinkSync('msbuild.rsp')
    }
  
} catch (error) {
    if (fs.existsSync('msbuild.rsp')) {
        var msbuildContent = fs.readFileSync('msbuild.rsp');
        console.log(msbuildContent);
        console.log(msbuildContent.toString());
        fs.unlinkSync('msbuild.rsp')
    }
  core.setFailed(error.message);
}