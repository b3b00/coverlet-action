const core = require("@actions/core");
const github = require("@actions/github");
const { exec, execSync } = require("child_process");
const path = require("path");
var fs = require("fs");

let  ab2str = (buf) => {
  return String.fromCharCode.apply(null, buf);
}

let convertAndPrint = (label, buf) => {
  if (buf) {
    let s = ab2str(buf);
    // let blob = new Blob([buf], { type: "text/plain; charset=utf-8" });
    // blob.text().then((text) => console.log(label + ":\n" + text));
    console.log(label+" : \n"+s);
    return s;
  }
};


let extractCoverageFromLine= (line) => {  
  var columns = line.split('|').filter(e => e);
  core.log("looking for coverage on line "+line);
  let linecol = columns[1].trim().replace('%','').replace(',','.');
  core.log("column 1 : "+columns[1]);
  var cd = parseFloat(linecol);
  return cd;
}

let extractCoverage = (lines) => {  
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

  console.log("create coverlet args");

  let msbuild = `-p:coverletOutput=${output} -p:CollectCoverage=true -p:CoverletOutputFormat=${outputFormat}`;
  if (excludestring !== null && excludestring !== undefined) {
    msbuild += ` -p:Exclude=\\"${excludestring}\\"`;
    console.log(`found exclusions ${excludestring}`);    
  }
  if (thresholdstring !== null && thresholdstring !== undefined && thresholdstring !== '') {
    msbuild += ` -p:Threshold=${thresholdstring}`
  }
  msbuild += ` ${testProject}`;

  console.log(`coverlet args ${msbuild}`);

  /* ***************************************/
  /* ***                                ****/
  /* ***  run dotnet test               ****/
  /* ***                                ****/
  /* ***************************************/

  console.log("run dotnet test");

try {

  var dotnet = execSync(`dotnet test -c Debug ${msbuild}`);
  var dotnetOutput = ab2str(dotnet);
  core.log("coverlet output is \n"+dotnetOutput);
  var coverage = extractCoverage(dotnetOutput.split('\n'));
  if (coverage < parseFloat(thresholdstring)) {
    core.setFailed(`coverage level too low : ${coverage} % , expecting ${thresholdstring} %`);
  }
  else {
    core.log(`excellent ! coverage is sill > ${thresholdstring} %  ! ${coverage} %`)
  }
}
catch(error) {
  var dotnetOutput = ab2str(error.stdout);
  core.log("coverlet output is \n"+dotnetOutput);
  var coverage = extractCoverage(dotnetOutput.split('\n'));
  if (coverage < parseFloat(thresholdstring)) {
    core.setFailed(`coverage level too low : ${coverage} % , expecting ${thresholdstring} %`);
  }
  else {
    core.log(`excellent ! coverage is sill > ${thresholdstring} %  ! ${coverage} %`)
  }
}

  /****************************************/
  /****                                ****/
  /****  delete msbuild.rsp            ****/
  /****  set coverageFile output       ****/
  /****                                ****/
  /****************************************/

  const testPath = path.dirname(testProject);
  const coverageFile = `${testPath}/${output}`;

if (fs.existsSync(output)) {
  console.log('output file found at ./ ! ');
}

  if (fs.existsSync(coverageFile)) {
    console.log("[1] coverage file created at " + coverageFile);
  } else {
    core.setFailed(
      `error occured : coverage file not found at ${coverageFile}`
    );
    console.log("[1] coverage file not found at " + coverageFile);
  }

  
  core.setOutput("coverageFile", coverageFile);

  console.log("coverlet test done.");
} catch (error) {
  console.log('global error '+error);    
  console.log(error.stack);
  core.setFailed(error.message);
}
