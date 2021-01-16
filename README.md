# Coverlet action

This action runs coverlet coverage tool on a dotnet core solution

## Inputs

### `testProject`

**Required** the path to the unit test csproj (relative to the repository root) ex :  `testProject/testProject.csproj

### `output` 

**Required** name of the coverage output file.

### `outputFormat`

**Required** format of the output coverage file (lcov,cobertura, ...) see coverlet documentation : [Coverage Output](https://github.com/coverlet-coverage/coverlet/blob/master/Documentation/GlobalTool.md#coverage-output)

### `excludes`

assemblies and namespaces exclusions for coverage : see coverlet documentation [Filters](https://github.com/coverlet-coverage/coverlet/blob/master/Documentation/GlobalTool.md#filters)
Filters must be separated with a ',' (comma).
example : ```[filteredAssembly1]*,[filteredAssembl2]namespace2.*```


## Outputs

### `coverageFile`
path to the generated coverage file. can be used to send data to coveralls for example.


## Example usage
```yaml
uses: b3b00/coverlet-action@1.1.0
with:
  testProject: 'myProjectTests/myProjectTests.csproj'
  output: 'lcov.info'
  outputFormat: 'lcov'
  excludes: '[program]*,[test]test.*'
```

### chaining coverlet with coveralls 


```yaml
- name : coverlet
uses: b3b00/coverlet-action@1.1.0
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
