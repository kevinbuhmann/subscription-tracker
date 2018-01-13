import { execute } from './helpers/shell.helpers';

(async () => {
  await execute('rimraf ./coverage');
  await execute(`tsc --project ./tsconfig.spec.json`);

  await unitTest();

  await execute('istanbul report -t lcov');
  await execute('istanbul report -t text-summary');
  // await execute('istanbul check-coverage --statements 90 --branches 90 --functions 90 --lines 90');
})();

async function unitTest() {
  await execute(getTestCommand('unit', './node_modules/jasmine/bin/jasmine.js', '--config=jasmine.json'));
  await execute(getRemapCoverageCommand('unit'));
}

function getTestCommand(testSet: string, script: string, args: string) {
  return `istanbul cover ${script} --dir ./coverage/${testSet} --print none -- ${args}`;
}

function getRemapCoverageCommand(testSet: string) {
  return `remap-istanbul -i ./coverage/${testSet}/coverage.json -o ./coverage/${testSet}/coverage.json -t json`;
}
