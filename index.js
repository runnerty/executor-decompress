"use strict";

var shell = require("shelljs");
var path = require("path");

var Execution = global.ExecutionClass;

class decompressExecutor extends Execution {
  constructor(process) {
    super(process);
  }

  exec(res) {
    var _this = this;

    function render(template, opts) {
      return new Function(
        "return new Function (" + Object.keys(opts).reduce((args, arg) => args += "\'" + arg + "\',", "") + "\'return `" + template.replace(/(^|[^\\])'/g, "$1\\\'") + "`;\'" +
        ").apply(null, " + JSON.stringify(Object.keys(opts).reduce((vals, key) => vals.push(opts[key]) && vals, [])) + ");"
      )();
    }

    function getFileType(filename) {
      var possibles = [];
      for (var key in COMPRESS_PROFILE) {
        var ext = "." + COMPRESS_PROFILE[key].EXT;
        var i = filename.indexOf(ext);
        if (i != -1 && i == (filename.length - ext.length) ) possibles.push(key);
      }
      if (possibles.length === 0) return -1;

      var max = 0;
      var result = -1;
      possibles.forEach(function(v, i, a) {
        var ext = "." + COMPRESS_PROFILE[v].EXT;
        if (ext.length > max) {
          max = ext.length;
          result = v;
        }
      });

      return result;
    }

    const COMPRESS_PROFILE = {
      "TAR": {
        SCRIPT: "mkdir -p ${dir} && tar -C ${dir} ${verbose} -xvf \"${fileName}\" ",
        SHELL: "tar",
        EXT: "tar",
      },
      "TAR_GZ": {
        SCRIPT: "mkdir -p ${dir} && tar -C ${dir} ${verbose} -xzvf \"${fileName}\" ",
        SHELL: "tar",
        EXT: "tar.gz",
      },
      "ZIP": {
        SCRIPT: "mkdir -p ${dir} && unzip -d ${dir} ${verbose} -o \"${fileName}\"",
        SHELL: "unzip",
        EXT: "zip",
      },
      "BZ2": {
        SCRIPT: "mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || true && cd ${dir} && bunzip2 ${verbose} -dk ${basename}",
        SHELL: "bzip2",
        EXT: "bz2",
      },
      "TAR_BZ2": {
        SCRIPT: "mkdir -p ${dir} && tar -C ${dir} ${verbose} -xjvf \"${fileName}\" ",
        SHELL: "tar",
        EXT: "tar.bz2",
      },
      "RAR": {
        SCRIPT: "mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || SAME_DIR=1 && cd ${dir} && unrar ${verbose} \"${basename}\" -y && if [[ -z $SAME_DIR ]]; then rm -frv \"${basename}\"; fi;",
        SHELL: "unrar",
        EXT: "rar",
      },
      "SEVEN_ZIP": {
        SCRIPT: "mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || SAME_DIR=1 && cd ${dir} 1>/dev/null && 7z x \"${basename}\" -y && if [[ -z $SAME_DIR ]]; then rm -frv \"${basename}\"; fi;",
        SHELL: "7z",
        EXT: "7z",
      },
      "TAR_TGZ": {
        SCRIPT: "mkdir -p ${dir} && tar -C ${dir} ${verbose} -xzvf \"${fileName}\" ",
        SHELL: "tar",
        EXT: "tar.tgz",
      },
      "TGZ": {
        SCRIPT: "mkdir -p ${dir} && tar -C ${dir} ${verbose} -xzvf \"${fileName}\" ",
        SHELL: "tar",
        EXT: "tgz",
      },
      "GZ": {
        SCRIPT: "mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || true && cd ${dir} && gunzip ${verbose} -d ${basename}",
        SHELL: "gunzip",
        EXT: "gz",
      },
    };



    var fileName = res.compress_file;
    var dir = res.decompress_dir;
    var verbose = "";
    var basename = path.basename(fileName);

    var type = getFileType(fileName);

    if (type === -1) {
      let endOptions = {
        end: "error",
        messageLog: `Error file type not found: ${fileName}`,
        execute_err_return: `Error file type not found: ${fileName}`
      };
      _this.end(endOptions);
    }else{
      var shScript = COMPRESS_PROFILE[type].SHELL;
      if (!shell.which(shScript)) {
        let endOptions = {
          end: "error",
          messageLog: `Error, script required ${shScript}, please install.`,
          execute_err_return: `Error, script required ${shScript}, please install.`
        };
        _this.end(endOptions);
      }else{
        if (type === "RAR") verbose = "x";

        var repVal = {fileName:fileName, dir:dir || "./", verbose:verbose, basename:basename};
        var script = COMPRESS_PROFILE[type].SCRIPT;
        var command = render(script, repVal);

        shell.exec(command, function(code, stdout, stderr) {
          if (code !== 0) {
            let endOptions = {
              end: "error",
              messageLog: `Error decompress process: ${stderr}`,
              execute_err_return: stderr
            };
            _this.end(endOptions);
          }else{
            let endOptions = {
              execute_return: stdout
            };
            _this.end(endOptions);
          }
        });
      }
    }

  }
}

module.exports = decompressExecutor;