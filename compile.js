"use strict";
exports.__esModule = true;
var ts = require("typescript");
var fs = require("fs");
var path = require("path");
function reportDiagnostics(diagnostics) {
    diagnostics.forEach(function (diagnostic) {
        var message = "Error";
        if (diagnostic.file) {
            var _a = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start), line = _a.line, character = _a.character;
            message += " " + diagnostic.file.fileName + " (" + (line + 1) + "," + (character + 1) + ")";
        }
        message += ": " + ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
        console.log(message);
    });
}
function readConfigFile(configFileName) {
    // Read config file
    var configFileText = fs.readFileSync(configFileName).toString();
    // Parse JSON, after removing comments. Just fancier JSON.parse
    var result = ts.parseConfigFileTextToJson(configFileName, configFileText);
    var configObject = result.config;
    if (!configObject) {
        reportDiagnostics([result.error]);
        process.exit(1);
        ;
    }
    // Extract config infromation
    var configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, path.dirname(configFileName));
    if (configParseResult.errors.length > 0) {
        reportDiagnostics(configParseResult.errors);
        process.exit(1);
    }
    return configParseResult;
}
function compile(configFileName) {
    // Extract configuration from config file
    var config = readConfigFile(configFileName);
    // Compile
    var program = ts.createProgram(config.fileNames, config.options);
    var emitResult = program.emit();
    // Report errors
    reportDiagnostics(ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics));
    // Return code
    var exitCode = emitResult.emitSkipped ? 1 : 0;
    process.exit(exitCode);
}
compile(process.argv[2]);
