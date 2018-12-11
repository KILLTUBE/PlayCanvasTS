"use strict";
exports.__esModule = true;
var fs = require("fs");
var ts = require("typescript");
function printStuff(node, stuffname) {
    var str = "";
    str += "\t"; // indentation
    str += "<" + stuffname + ">";
    str += " ";
    var property = node[stuffname];
    if (property !== undefined) {
        if (property.getText)
            str += property.getText();
        else
            str += "missing property.getText()";
    }
    else {
        return; // meh, dont print anything if it doesnt exist
        str += "property undefined";
    }
    str += " ";
    str += "</" + stuffname + ">";
    console.log(str);
}
function visit(node) {
    if (ts.isFunctionDeclaration(node)) {
        var funcdef = node;
        for (var _i = 0, _a = funcdef.parameters; _i < _a.length; _i++) {
            var param = _a[_i];
            console.log(param.name.getText());
        }
    }
    if (ts.isClassDeclaration(node)) {
        var classDeclaration = node;
        for (var _b = 0, _c = classDeclaration.members; _b < _c.length; _b++) {
            var member = _c[_b];
            //console.log("<text>", member.getText(), "</text>");
            switch (member.kind) {
                //case ts.SyntaxKind.PropertyDeclaration:
                //	var propertyDeclaration = <ts.PropertyDeclaration> <ts.Node> node;
                //	console.log("<PropertyDeclaration>")
                //	printStuff(propertyDeclaration, "decorators");
                //	printStuff(propertyDeclaration, "modifiers");
                //	printStuff(propertyDeclaration, "name");
                //	printStuff(propertyDeclaration, "questionToken");
                //	printStuff(propertyDeclaration, "type");
                //	printStuff(propertyDeclaration, "initializer");
                //	console.log("</PropertyDeclaration>")
                //	break;
                //case ts.SyntaxKind.MethodDeclaration:
                //	var methodDeclaration = <ts.MethodDeclaration> <ts.Node> node;
                //	console.log("<MethodDeclaration>")
                //	printStuff(methodDeclaration, "decorators");
                //	printStuff(methodDeclaration, "modifiers");
                //	printStuff(methodDeclaration, "name");
                //	printStuff(methodDeclaration, "typeParameters");
                //	printStuff(methodDeclaration, "parameters");
                //	printStuff(methodDeclaration, "type");
                //	printStuff(methodDeclaration, "body");
                //	console.log("</MethodDeclaration>")
                //	break;
                default:
                    var kind = ts.SyntaxKind[member.kind];
                    console.log("<" + kind + ">");
                    printStuff(member, "decorators");
                    printStuff(member, "modifiers");
                    printStuff(member, "name");
                    printStuff(member, "questionToken");
                    printStuff(member, "initializer");
                    printStuff(member, "typeParameters");
                    printStuff(member, "parameters");
                    printStuff(member, "type");
                    printStuff(member, "body");
                    console.log("</" + kind + ">");
            }
        }
    }
    node.forEachChild(visit);
}
function instrument(fileName, sourceCode) {
    var sourceFile = ts.createSourceFile(fileName, sourceCode, ts.ScriptTarget.Latest, true);
    visit(sourceFile);
}
var inputFile = process.argv[2];
instrument(inputFile, fs.readFileSync(inputFile, 'utf-8'));
