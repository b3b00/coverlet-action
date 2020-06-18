const core = require('@actions/core');
const github = require('@actions/github');
const { exec, execSync } = require("child_process");
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
/****  creer un fichier msbuild.rsp  ****/
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
/* ***  lancer dotnet test            ****/
/* ***                                ****/
/* ***************************************/

var ls = execSync('ls -la');
console.log(ls.toString());

var dotnet = execSync('dotnet test -c Debug');
console.log(dotnet.toString());

/****************************************/
/****                                ****/
/****  supprimer msbuild.rsp         ****/
/****                                ****/
/****************************************/

if (fs.existsSync('msbuild.rsp')) {
    fs.unlink('msbuild.rsp')
}

    exec("dotnet --info", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);
} catch (error) {
    if (fs.existsSync('msbuild.rsp')) {
        var msbuildContent = fs.readFileSync('msbuild.rsp');
        console.log(msbuildContent);
        console.log(msbuildContent.toString());
        fs.unlinkSync('msbuild.rsp')
    }
  core.setFailed(error.message);
}