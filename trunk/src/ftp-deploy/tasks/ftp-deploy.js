module.exports = function (grunt) {

  var Ftp = require('jsftp'),
      async = require('async'),
      path = require('path'),
      prompt = require('prompt');

  var ftp;

  function doEnsureFolder(inPath, cb) {
    grunt.log.debug('Ensure folder ' + inPath);
    ftp.raw.cwd(inPath, function (err) {
      if(!err) {
        grunt.log.debug('Folder ' + inPath + ' changed');
        return cb(null);
      }

      doEnsureFolder(path.dirname(inPath), function (err) {
        if (err) {
          return cb(err);
        }
      
        grunt.log.debug('Creating new remote folder ' + inPath);
        return ftp.raw.mkd(inPath, function (err) {
          err ? grunt.log.error('Error creating new remote folder ' + inPath + ' --> ' + err)
              : grunt.log.ok('New remote folder created ' + inPath);
              
          return cb(err);
        });
      });
    });
  }

  function doPutFile(inFilename, outFilename, done) {
    ftp.raw.size(outFilename, function (err) {
      if (!err) {
        grunt.log.debug('File exists: ' + outFilename)
        done();
        return;
      }
      
      grunt.log.debug('Started file upload: ' + inFilename);
      ftp.put(inFilename + '', outFilename + '', function (err) {
        err ? grunt.log.error('Cannot upload file: ' + inFilename + ' --> ' + err)
            : grunt.log.ok('Complete file upload: ' + outFilename);

        done(err);
      });
    });
  }

  function doUploadEntity(entry, done) {
    doPutFile(entry.src, entry.dest, function (err) {
      if (err) {
        grunt.warn('Failed uploading files!');
      }
      done(null);
    });
  }  

  function getAuthByKey(inKey) {
    return grunt.file.exists('.ftppass') && grunt.file.readJSON('.ftppass')[inKey] || {};
  }

  grunt.registerMultiTask('ftp-deploy', 'Deploy over FTP', function () {
    var done = this.async();

    ftp = new Ftp({
      host: this.data.auth.host,
      port: this.data.auth.port,
      onError: function (err) {
        log.error(err);
        done()
      }
    });

    ftp.useList = true;

    var authVals = getAuthByKey(this.data.auth.authKey ? this.data.auth.authKey : this.data.auth.host);
    var files = this.files;

    var needed = {properties: {}};
    if (!authVals.username) needed.properties.username = {};
    if (!authVals.password) needed.properties.password = {hidden:true};

    prompt.get(needed, function (err, result) {
      err && grunt.warn('Authentication ' + err);

      if (result.username) authVals.username = result.username;
      if (result.password) authVals.password = result.password;

      ftp.auth(authVals.username, authVals.password, function (err) {
        err && grunt.warn('Authentication ' + err);

        var folders = {};
        files.forEach(function (entry) {
          folders[path.dirname(entry.dest)] = true;
        });
        
        // todo verify folders
        async.eachSeries(Object.getOwnPropertyNames(folders), doEnsureFolder, function () {
          // folders varified
          
          // lets upaload files
          async.eachSeries(files, doUploadEntity, function () {
            ftp.raw.quit(function (err) {
              err ? grunt.log.error(err)
                  : grunt.log.ok('FTP upload done!');

              done();
            });
          });
        })
      });
    });
  });
};
