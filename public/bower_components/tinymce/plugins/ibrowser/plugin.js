
var sendFiles = function(files, options, callback) {
  if(!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }
  if(typeof callback !== 'function') {
    return false;
  }
  var filesArray = Array.prototype.slice.call(files),
      formData = new FormData(),
      defer = $.Deferred(),
      urlQuery = {
        folder: options.folder
      },
      url = '/admin/upload?' + $.param(urlQuery);

  filesArray.forEach(function(file, index) {
    formData.append('file' + index, file);
  });

  var ajaxOptions = {
    url: url,
    data: formData,
    processData: false,
    contentType: false,
    cache: false,
    type: 'POST',
    success: function (data) {
      if(data.status == 200) {
        defer.resolve(data);
      } else {
        defer.reject(data);
      }
    }
  };

  if(options.progress) {
    options.progress.progress({percent: 0});
    ajaxOptions.xhr = function() {
      var xhr = new window.XMLHttpRequest();
      xhr.upload.addEventListener("progress", function(evt) {
        if(evt.lengthComputable) {
          var percent = parseInt((evt.loaded / evt.total) * 100);
          options.progress.progress({percent: percent});
        }
      }, false);
      return xhr;
    };
  }

  $.ajax(ajaxOptions);

  defer.then(function(data) {
    callback(null, data);
  }).fail(function(err) {
    console.log(err);
    callback(err);
  });
};

tinymce.PluginManager.add('ibrowser', function(editor, url) {
  //console.log(arguments);
  var filesListTemplate = _.template($('#files_list_template').html());

  editor.settings.file_browser_callback = function(id, value, type, win) {
    //console.log(arguments);
    var currPath = [];
    $.get('/admin/filesList', {folder: '/'}, function(data) {
      var treePanel = {
        type: 'container',
        minHeight: 500,
        minWidth: 800,
        html: filesListTemplate(data)
      };

      var modalWindow = tinymce.activeEditor.windowManager.open({
        title: 'Insert something',
        items: [treePanel],
        buttons: [
          {
            text: "Cancel",
            onclick: function() {
              modalWindow.close();
            }
          }
        ]
      });

      var filesListClickHandler = function() {
        var $item = $(this);

        if($item.data('type') == 'file') {
          var data = {
            src: $item.data('filePath')
          };
          editor.focus();
          editor.selection.setContent(editor.dom.createHTML('img', data));
          modalWindow.close();
          tinymce.activeEditor.windowManager.windows.forEach(function(window) {
            window.close();
          });
        } else if($item.data('type') == 'dir') {
          $.get('/admin/filesList', {folder: '/' + $item.find('.title').text()}, function(data) {
            $modalElem.find('.files_list_wrp').replaceWith(filesListTemplate(data));
            currPath.push($item.find('.title').text());
          });
        }
      };

      var $modalElem = $('#' + modalWindow._id);

      $modalElem.off('click', '.files_list .item', filesListClickHandler);
      $modalElem.on('click', '.files_list .item', filesListClickHandler);
      $modalElem.on('click', '.files_list_wrp .navigation .back', function() {
        currPath.splice(-1, 1);
        $.get('/admin/filesList', {folder: currPath.join('/')}, function(data) {
          $modalElem.find('.files_list_wrp').replaceWith(filesListTemplate(data));
        });
      });

      $modalElem.on('change', 'input[type="file"]', function() {
        var $input = $(this),
            files = $input[0].files;

        if(!files.length) {
          return;
        }

        sendFiles(files, {folder: currPath.join('/')}, function(err/*, data*/) {
          if(err) {
            return alert('err!');
          }

          $.get('/admin/filesList', {folder: currPath.join('/')}, function(data) {
            $modalElem.find('.files_list_wrp').replaceWith(filesListTemplate(data));
          });
        });
      });
    });
  };

});
