//const core = require("@actions/core");
const core = require("../JsGithubActionEmulator/core");
const github = require("@actions/github");
const { exec, execSync } = require("child_process");
const path = require("path");
var fs = require("fs");


function ab2str(buf) {
  return String.fromCharCode.apply(null, buf);
}


function extractCoverageFromLine(line) {
  var columns = line.split("|").filter((e) => e);
  let linecol = columns[1].trim().replace("%", "").replace(",", ".");
  var cd = parseFloat(linecol);
  return cd;
}

function extractCoverage(lines) {
  const header = "| Total   |";
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    if (line.startsWith(header)) {
      return extractCoverageFromLine(line);
    }
    i++;
  }
  return null;
}

function assertCoverageThreshold(buffer, thresholdstring) {
  var dotnetOutput = ab2str(buffer);
  console.log(`Checking threshold ${thresholdstring}`)
  console.log(dotnetOutput);
  var coverage = extractCoverage(dotnetOutput.split("\n"));
  if (coverage !== null && coverage !== undefined) {
    if (coverage < parseFloat(thresholdstring)) {
      core.setFailed(
        `coverage level too low : ${coverage} % , expecting ${thresholdstring} %`
      );
    }
  }
}

try {
  const output = core.getInput("output");
  const outputFormat = core.getInput("outputFormat");
  const testProject = core.getInput("testProject");
  let excludestring = core.getInput("excludes");
  let includestring = core.getInput("excludes");
  let thresholdstring = core.getInput("threshold");

  /****************************************/
  /****                                ****/
  /****  create coverlet args          ****/
  /****                                ****/
  /****************************************/


  let msbuild = `-p:coverletOutput=${output} -p:CollectCoverage=true -p:CoverletOutputFormat=${outputFormat}`;
  if (excludestring !== null && excludestring !== undefined) {
    msbuild += ` -p:Exclude=\\"${excludestring}\\"`;
  }
  
  msbuild += ` ${testProject}`;

  /* ***************************************/
  /* ***                                ****/
  /* ***  run dotnet test               ****/
  /* ***                                ****/
  /* ***************************************/

  console.log(`run dotnet test -c Debug ${msbuild}`);

  try {
    var dotnet = execSync(`dotnet test -c Debug ${msbuild}`);
    console.log(`dotnet succeeded`);
    assertCoverageThreshold(dotnet, thresholdstring);
  } catch (error) {
    console.log(`dotnet failed`);    
    assertCoverageThreshold(error.stdout, thresholdstring);    
    core.setFailed('dotnet test failure '+error.message)
  }

  /****************************************/
  /****                                ****/
  /****  delete msbuild.rsp            ****/
  /****  set coverageFile output       ****/
  /****                                ****/
  /****************************************/

  const testPath = path.dirname(testProject);
  const coverageFile = `${testPath}/${output}`;


  if (!fs.existsSync(coverageFile)) {
    core.setFailed(
      `error occured : coverage file not found at ${coverageFile}`
    );    
  }

  core.setOutput("coverageFile", coverageFile);

  console.log("coverlet test done.");
} catch (error) {
  console.log("global error " + error);
  console.log(error.stack);
  core.setFailed(error.message);
}
