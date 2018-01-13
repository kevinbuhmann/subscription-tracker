import * as Lint from 'tslint';
import * as ts from 'typescript';

const OBSERVABLE_TYPE_PATTERNS = [/^Observable$/, /Subject$/, /^EventEmitter$/];

export class Rule extends Lint.Rules.TypedRule {
  static FAILURE_STRING = 'Do not use \'.subscribe(...)\'. Use \'.subscribeAndTrack(...)\' instead.';
  static NEW_OBSERVABLE_FAILURE_STRING = 'Remember to return an observable\'s inner subscription as its teardown logic';

  applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithFunction(sourceFile, walk, undefined, program.getTypeChecker());
  }
}

function walk(context: Lint.WalkContext<void>, typeChecker: ts.TypeChecker) {
  ts.forEachChild(context.sourceFile, function visit(node) {
    if (ts.isPropertyAccessExpression(node) && isSubscribeCall(node, typeChecker) && !isInNewObservableTeardownLogic(node)) {
      const failureString = isInNewObservableCall(node) ? Rule.NEW_OBSERVABLE_FAILURE_STRING : Rule.FAILURE_STRING;
      context.addFailureAtNode(node.name, failureString);
    }

    ts.forEachChild(node, visit);
  });
}

function isSubscribeCall(node: ts.PropertyAccessExpression, typeChecker: ts.TypeChecker) {
  return node.name.getText() === 'subscribe' && isObservableType(typeChecker.getTypeAtLocation(node.expression));
}

function isInNewObservableTeardownLogic(node: ts.Node) {
  const parentReturnStatement = getParentOfType(node, ts.isReturnStatement);
  const parentArrowFunctionOrFunctionDeclaration = getParentOfType(parentReturnStatement, isArrowFunctionOrFunctionDeclaration);

  return parentArrowFunctionOrFunctionDeclaration
    && parentArrowFunctionOrFunctionDeclaration.parent
    && ts.isNewExpression(parentArrowFunctionOrFunctionDeclaration.parent)
    && parentArrowFunctionOrFunctionDeclaration.parent.expression.getText() === 'Observable';
}

function isInNewObservableCall(node: ts.Node) {
  const parentNewExpression = getParentOfType(node, ts.isNewExpression);
  return parentNewExpression && parentNewExpression.expression.getText() === 'Observable';
}

function isArrowFunctionOrFunctionDeclaration(node: ts.Node): node is ts.ArrowFunction | ts.FunctionDeclaration {
  return ts.isArrowFunction(node) || ts.isFunctionDeclaration(node);
}

function isObservableType(type: ts.Type) {
  const typeName = type && type.symbol ? type.symbol.name : undefined;
  return OBSERVABLE_TYPE_PATTERNS.some(pattern => pattern.test(typeName));
}

export function getParentOfType<T extends ts.Node>(node: ts.Node, predicate: (n: ts.Node) => n is T) {
  let parent = node ? node.parent : undefined;

  while (parent && !predicate(parent)) {
    parent = parent.parent;
  }

  return parent as T;
}
