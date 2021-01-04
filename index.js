'use strict';

const shell = require('shelljs');
const path = require('path');

const Executor = require('@runnerty/module-core').Executor;

class decompressExecutor extends Executor {
  constructor(process) {
    super(process);
  }

  exec(res) {
    const COMPRESS_PROFILE = {
      TAR: {
        SCRIPT: 'mkdir -p ${dir} && tar -C ${dir} ${verbose} -xvf "${fileName}" ',
        SHELL: 'tar',
        EXT: 'tar'
      },
      TAR_GZ: {
        SCRIPT: 'mkdir -p ${dir} && tar -C ${dir} ${verbose} -xzvf "${fileName}" ',
        SHELL: 'tar',
        EXT: 'tar.gz'
      },
      ZIP: {
        SCRIPT: 'mkdir -p ${dir} && unzip -d ${dir} ${verbose} -o "${fileName}"',
        SHELL: 'unzip',
        EXT: 'zip'
      },
      BZ2: {
        SCRIPT:
          'mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || true && cd ${dir} && bunzip2 ${verbose} -dk ${basename}',
        SHELL: 'bzip2',
        EXT: 'bz2'
      },
      TAR_BZ2: {
        SCRIPT: 'mkdir -p ${dir} && tar -C ${dir} ${verbose} -xjvf "${fileName}" ',
        SHELL: 'tar',
        EXT: 'tar.bz2'
      },
      RAR: {
        SCRIPT:
          'mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || SAME_DIR=1 && cd ${dir} && unrar ${verbose} "${basename}" -y && if [[ -z $SAME_DIR ]]; then rm -frv "${basename}"; fi;',
        SHELL: 'unrar',
        EXT: 'rar'
      },
      SEVEN_ZIP: {
        SCRIPT:
          'mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || SAME_DIR=1 && cd ${dir} 1>/dev/null && 7z x "${basename}" -y && if [[ -z $SAME_DIR ]]; then rm -frv "${basename}"; fi;',
        SHELL: '7z',
        EXT: '7z'
      },
      TAR_TGZ: {
        SCRIPT: 'mkdir -p ${dir} && tar -C ${dir} ${verbose} -xzvf "${fileName}" ',
        SHELL: 'tar',
        EXT: 'tar.tgz'
      },
      TGZ: {
        SCRIPT: 'mkdir -p ${dir} && tar -C ${dir} ${verbose} -xzvf "${fileName}" ',
        SHELL: 'tar',
        EXT: 'tgz'
      },
      GZ: {
        SCRIPT:
          'mkdir -p ${dir} && cp -fr ${fileName} ${dir}/ 2>/dev/null || true && cd ${dir} && gunzip ${verbose} -d ${basename}',
        SHELL: 'gunzip',
        EXT: 'gz'
      }
    };

    const fileName = res.compress_file;
    const dir = res.decompress_dir;
    let verbose = '';
    const basename = path.basename(fileName);

    const type = this.getFileType(fileName, COMPRESS_PROFILE);

    if (type === -1) {
      const endOptions = {
        end: 'error',
        messageLog: `Error file type not found: ${fileName}`,
        err_output: `Error file type not found: ${fileName}`
      };
      this.end(endOptions);
    } else {
      const shScript = COMPRESS_PROFILE[type].SHELL;
      if (!shell.which(shScript)) {
        const endOptions = {
          end: 'error',
          messageLog: `Error, script required ${shScript}, please install.`,
          err_output: `Error, script required ${shScript}, please install.`
        };
        this.end(endOptions);
      } else {
        if (type === 'RAR') verbose = 'x';

        const repVal = {
          fileName: fileName,
          dir: dir || './',
          verbose: verbose,
          basename: basename
        };
        const script = COMPRESS_PROFILE[type].SCRIPT;
        const command = this.render(script, repVal);

        shell.exec(command, (code, stdout, stderr) => {
          if (code !== 0) {
            const endOptions = {
              end: 'error',
              messageLog: `Error decompress process: ${stderr}`,
              err_output: stderr
            };
            this.end(endOptions);
          } else {
            const endOptions = {
              msg_output: stdout
            };
            this.end(endOptions);
          }
        });
      }
    }
  }

  render(template, opts) {
    return new Function(
      'return new Function (' +
        Object.keys(opts).reduce((args, arg) => (args += "'" + arg + "',"), '') +
        "'return `" +
        template.replace(/(^|[^\\])'/g, "$1\\'") +
        "`;'" +
        ').apply(null, ' +
        JSON.stringify(Object.keys(opts).reduce((vals, key) => vals.push(opts[key]) && vals, [])) +
        ');'
    )();
  }

  getFileType(filename, COMPRESS_PROFILE) {
    const possibles = [];
    for (const key in COMPRESS_PROFILE) {
      const ext = '.' + COMPRESS_PROFILE[key].EXT;
      const i = filename.toLowerCase().indexOf(ext);
      if (i != -1 && i == filename.length - ext.length) possibles.push(key);
    }
    if (possibles.length === 0) return -1;

    let max = 0;
    let result = -1;
    possibles.forEach(v => {
      const ext = '.' + COMPRESS_PROFILE[v].EXT;
      if (ext.length > max) {
        max = ext.length;
        result = v;
      }
    });

    return result;
  }
}

module.exports = decompressExecutor;
