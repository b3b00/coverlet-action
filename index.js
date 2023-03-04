const core = require("@actions/core");
//const core = require("../JsGithubActionEmulator/core");
const github = require("@actions/github");
const { exec, execSync } = require("child_process");
const path = require("path");
var fs = require("fs");

function ab2str(buf, debug=false) {
  if (debug) {
    console.log(`converting output to string , length is ${buf.length}`);
  }
  const uint8Array = new Uint8Array(buf);
  if (debug) {
    console.log(`buffer converted to Uint8Array`);
  }
  const data = uint8Array.reduce((acc, i) => acc += String.fromCharCode.apply(null, [i]), '');
  if (debug) {
    console.log(`uint8aray reduced to string >>>${data}<<<`);
  }
  return data;
}


function extractCoverageFromLine(line, debug=false) {
  var columns = line.split("|").filter((e) => e);
  if (debug) {
    console.log(`coverage columns are `,columns);
  }
  let linecol = columns[1].trim().replace("%", "").replace(",", ".");
  if (debug) {
    console.log(`total column is ${linecol}`);
  }
  var cd = parseFloat(linecol);
  return cd;
}

function extractCoverage(lines, debug=false) {
  const header = "| Total   |";
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    if (debug) {
      console.log(`searching total coverage in line >>>${line}<<<`);
      console.log();
    }
    if (line.startsWith(header)) {
      console.log(`total coverage found in line >>>${line}<<<`);
      console.log();
      return extractCoverageFromLine(line,debug);
    }
    i++;
  }
  if (debug) {
    console.log(`total coverage line not found `);
    console.log();
  }
  return null;
}

function assertCoverageThreshold(buffer, thresholdstring, debug=false) {
  var dotnetOutput = ab2str(buffer,false);
  console.log(`Checking threshold ${thresholdstring}`)
  console.log(dotnetOutput);
  var coverage = extractCoverage(dotnetOutput.split("\n"),debug);
  if (coverage !== null && coverage !== undefined) {
    if (coverage < parseFloat(thresholdstring)) {
      core.setFailed(
        `coverage level too low : ${coverage} % , expecting ${thresholdstring} %`
      );
    }
  }
}

try {
  console.log('starting...');
  const output = core.getInput("output");
  console.log("output : "+output);
  const outputFormat = core.getInput("outputFormat");
  console.log(`format ${outputFormat}`)
  const testProject = core.getInput("testProject");
  console.log(`UT project ${testProject}`)
  let excludestring = core.getInput("excludes");
  console.log(`excludes ${excludestring}`)
  let includestring = core.getInput("excludes");
  console.log(`includes ${includestring}`)
  let thresholdstring = core.getInput("threshold");
  console.log(`threshold ${thresholdstring}`)
  let debugstring = core.getInput("debug");
  console.log(`debug ${debugstring}`);
  let debug = debugstring == 'true';

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
    if (debug) {
      console.log('dotnet raw output :');
      console.log(dotnet);
    }
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



  fs.appendFileSync(process.env.GITHUB_OUTPUT,`coverageFile=${coverageFile}`, {
    encoding: 'utf8'
  });  
  //core.setOutput("coverageFile", coverageFile);

  console.log("coverlet test done.");
} catch (error) {
  console.log("global error " + error);
  console.log(error.stack);
  core.setFailed(error.message);
}
