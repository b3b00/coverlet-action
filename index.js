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

console.log("create msbuild.rsp file");

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

console.log("run dotnet test");

var dotnet = execSync('dotnet test -c Debug');
console.log(dotnet.toString());

/****************************************/
/****                                ****/
/****  delete msbuild.rsp            ****/
/****  set coverageFile output       ****/
/****                                ****/
/****************************************/

    const coverageFile = `${path.dirname(testProject)}${path.delimiter}${testProject}\${output}`;

    console.log(`delete msbuild.rsp and set coverageFile output : ${coverageFile}`);

    if (fs.existsSync('msbuild.rsp')) {
        core.setOutput("coverageFile", coverageFile );
        fs.unlinkSync('msbuild.rsp');        
    }
    else {
        core.setFailed(`unable to find coverage file ${coverageFile}`);
    }

  
} catch (error) {
    if (fs.existsSync('msbuild.rsp')) {
        core.setFailed(`error occured : ${error}`);
        fs.unlinkSync('msbuild.rsp')
    }
  core.setFailed(error.message);
}