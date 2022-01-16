"use strict";
exports.__esModule = true;
var urlRe = "[\\w\\-./?:_%=&]+(?:#gh-(?:(?:light)|(?:dark))-mode-only)(?:[\\w\\-./?:_%=&]+)?";
var markdownInlineLinkRe = new RegExp("(?:!?\\[(?:[^[\\]]|\\[[^\\]]*\\])*\\])\\(" +
    urlRe +
    "(?:\\s[\"\\']\\w+[\"\\'])?\\)", "g");
var markdownReferenceLinkRe = new RegExp("\\s{0,3}\\[[^\\]]+]:\\s" + urlRe + "(?:\\s[\"']\\w+[\"'])?", "g");
var htmlTagRe = new RegExp("<[a-zA-Z][^>]+=[\"']?" + urlRe + "[\"']?[^>]*\\/?>", "g");
var newLineRe = new RegExp("(\\r\\n|\\n|\\r)");
var emptyLineRe = new RegExp("^(\\r\\n|\\n|\\r)$");
var splitLinesRe = new RegExp("^.*((\\r\\n|\\n|\\r)|$)", "gm");
function _splitlines(content) {
    return content.match(splitLinesRe);
}
function _getEmptyLineNumbers(content) {
    return _splitlines(content)
        .map(function (line, i) {
        return line.replace(newLineRe, "") ? null : i;
    })
        .filter(function (num) { return num !== null; });
}
/**
 * @param content Content for which Github theme image links
 * will be stripped.
 * @param keep Theme variant links to keep in the content.
 * @returns Content with Github theme links stripped.
 */
function stripGhThemeLinks(content, keep) {
    var expectedSubstringToKeep = "#gh-".concat(keep, "-mode-only"), expectedSubstringToStrip = "#gh-".concat(keep === "dark" ? "light" : "dark", "-mode-only");
    // store empty line numbers from original content
    var emptyLineNumbers = _getEmptyLineNumbers(content);
    function stripLinks(partialContent) {
        function replacer(match) {
            return match.includes(expectedSubstringToKeep)
                ? match.replace(expectedSubstringToKeep, "")
                : // only strip if includes the substring for other theme
                    match.includes(expectedSubstringToStrip)
                        ? ""
                        : match.replace(expectedSubstringToKeep, "");
        }
        var transformed = partialContent
            .replace(markdownInlineLinkRe, replacer)
            .replace(markdownReferenceLinkRe, replacer)
            .replace(htmlTagRe, replacer);
        // call recursively until all the `gh-${theme}-mode-only` links
        // are stripped. This is easier to maintain than writing more complex
        // regexes to fulfill the matching multiple times in a line.
        if (transformed.length !== partialContent.length) {
            return stripLinks(transformed);
        }
        return transformed;
    }
    // strip new generated empty lines
    var lines = _splitlines(stripLinks(content)), newLines = [];
    for (var i = 0; i < lines.length; i++) {
        if (!emptyLineNumbers.includes(i) && // is not original empty line
            !lines[i].replace(emptyLineRe, "") // is a new empty line
        ) {
            if (!emptyLineNumbers.includes(i - 1)) {
                newLines[i - 1] = newLines[i - 1].replace(newLineRe, "");
            }
        }
        else {
            newLines.push(lines[i]);
        }
    }
    return newLines.join("");
}
exports["default"] = stripGhThemeLinks;
