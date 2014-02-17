/// <reference path="../_references.d.ts" />
angular.module('dotjem.routing.pages').service('syntax', [
    'scriptLoader',
    function (scriptLoader) {
        var $service = {};
        var brushmapping = {};

        SyntaxHighlighter.defaults['toolbar'] = false;
        SyntaxHighlighter.defaults['gutter'] = false;

        push('shBrushAppleScript.js', 'applescript');
        push('shBrushAS3.js', 'actionscript3', 'as3');
        push('shBrushBash.js', 'bash', 'shell');
        push('shBrushColdFusion.js', 'coldfusion', 'cf');
        push('shBrushCpp.js', 'cpp', 'c');
        push('shBrushCSharp.js', 'c#', 'c-sharp', 'csharp');
        push('shBrushCss.js', 'css');
        push('shBrushDelphi.js', 'delphi', 'pascal');
        push('shBrushDiff.js', 'diff', 'patch', 'pas');
        push('shBrushErlang.js', 'erl', 'erlang');
        push('shBrushGroovy.js', 'groovy');
        push('shBrushJava.js', 'java');
        push('shBrushJavaFX.js', 'jfx', 'javafx');
        push('shBrushJScript.js', 'js', 'jscript', 'javascript');
        push('shBrushPerl.js', 'perl', 'pl');
        push('shBrushPhp.js', 'php');
        push('shBrushPlain.js', 'text', 'plain');
        push('shBrushPython.js', 'py', 'python');
        push('shBrushRuby.js', 'ruby', 'rails', 'ror', 'rb');
        push('shBrushSass.js', 'sass', 'scss');
        push('shBrushScala.js', 'scala');
        push('shBrushSql.js', 'sql');
        push('shBrushVb.js', 'vb', 'vbnet');
        push('shBrushXml.js', 'xml', 'xhtml', 'xslt', 'html');

        function push(file) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            for (var i = 0; i < args.length; i++) {
                brushmapping[args[i]] = 'assets/scripts/syntaxhighlight/impl/' + file;
            }
        }

        function parseParams(str) {
            var match, result = {}, arrayRegex = new XRegExp("^\\[(?<values>(.*?))\\]$"), regex = new XRegExp("(?<name>[\\w-]+)" + "\\s*:\\s*" + "(?<value>" + "[\\w-%#]+|" + "\\[.*?\\]|" + '".*?"|' + "'.*?'" + ")\\s*;?", "g");

            while ((match = regex.exec(str)) != null) {
                var value = match.value.replace(/^['"]|['"]$/g, '');
                if (value != null && arrayRegex.test(value)) {
                    var m = arrayRegex.exec(value);
                    value = m.values.length > 0 ? m.values.split(/\s*,\s*/) : [];
                }
                result[match.name] = value;
            }

            return result;
        }

        $service.Highlight = function (elm) {
            var params = parseParams(elm.attr('class'));
            scriptLoader.LoadScript(brushmapping[params.brush]);
            SyntaxHighlighter.highlight(params, elm[0]);
        };
        return $service;
    }]);
//# sourceMappingURL=syntax.js.map
