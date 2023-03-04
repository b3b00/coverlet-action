# Coverlet action

This action runs [coverlet coverage](https://github.com/coverlet-coverage/coverlet) tool on a dotnet core solution

>### ⚠️ This action assumes that your unit test projects are correctly using coverlet packages.

## Inputs

### `testProject`

**Required** the path to the unit test csproj (relative to the repository root) e.g. `testProject/testProject.csproj

### `output` 

**Required** name of the coverage output file.

### `outputFormat`

**Required** format of the output coverage file (lcov,cobertura, ...) see coverlet documentation : [Coverage Output](https://github.com/coverlet-coverage/coverlet/blob/master/Documentation/GlobalTool.md#coverage-output)

### `excludes`

assemblies and namespaces exclusions for coverage : see coverlet documentation [Filters](https://github.com/coverlet-coverage/coverlet/blob/master/Documentation/GlobalTool.md#filters)
Filters must be separated with a ',' (comma).
example : ```[filteredAssembly1]*,[filteredAssembl2]namespace2.*```

### `threshold`

Minimum coverage percent on all changes to your project below which build will fail.
example : ```80```

### `debug`

if true , produces extra debug output. Optional, false is default



## Outputs

### `coverageFile`
path to the generated coverage file. can be used to send data to coveralls for example.


## Example usage
```yaml
uses: b3b00/coverlet-action@1.1.9
with:
  testProject: 'myProjectTests/myProjectTests.csproj'
  output: 'lcov.info'
  outputFormat: 'lcov'
  excludes: '[program]*,[test]test.*'
  threshold: 80
```

### chaining coverlet with coveralls 


```yaml
- name : coverlet
uses: b3b00/coverlet-action@1.1.9
with:
  testProject: 'myProjectTests/myProjectTests.csproj'
  output: 'lcov.info'
  outputFormat: 'lcov'
  excludes: '[program]*,[test]test.*'
- name: coveralls      
uses: coverallsapp/github-action@v1.1.1
with:
  github-token: ${{secrets.GITHUB_TOKEN }} 
  path-to-lcov: ${{steps.coverlet.outputs.coverageFile}} 
```
