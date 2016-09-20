var fs = require('fs');
var path = require('path');

var marked = require('marked');
var regex = require('../regex');

function convert(file) {
    var res = '';
    var vars = [];

    var text = fs.readFileSync(file, 'utf8');

    var md = text.replace(regex.REGEX_VARIABLE, function (match, key, ref, val) {
        vars.push(key);
        res += 'var ' + key + ' = ';
        if (ref) {
            var dir = path.dirname(file);
            var resolve = path.resolve(dir, ref);
            res += '{\tfile : "' + resolve + '",\n';
            if (val) res += '\tvars : ' + val + '}\n';
            else if (!val) res += '}';
        } else if (!ref) {
            if (val) res+= val;
        }
        res += ';\n\n';
        return '';
    });

    res += 'module.exports = {' + '\n';
    res += 'vars : {' + '\n';
    res += vars.map(function(vari){
            return '\t' + vari + ' : ' + vari
        }).join(',') + '\n';
    res += '},' + '\n';
    res += 'text : ' + JSON.stringify(md, null, 4) + '\n';
    res += '};' + '\n';

    try{
        return eval(res);
    }catch (e){
        var e = new Error(e);
        e.file = file
        throw(e)
    }

}

module.exports = convert;
