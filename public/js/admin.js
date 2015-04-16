
$(function() {

  $('.tinymce').tinymce({
    script_url: '/public/bower_components/tinymce/tinymce.min.js',
    content_css : ["/public/css/main.css", '/public/bower_components/bootstrap/dist/css/bootstrap.css', '/public/bower_components/bootstrap/dist/css/bootstrap-theme.css'],
    language: "ru",
    theme: "modern",
    convert_urls: true,
    relative_urls: false,
    document_base_url: '/',
    custom_undo_redo_levels: 100,
    valid_elements : "*[*]",
    height : 300,
    schema: "html5",
    plugins: [
      ["advlist anchor autolink autosave charmap code colorpicker contextmenu"],
      ["directionality emoticons fullscreen hr image importcss insertdatetime"],
      ["link lists media nonbreaking pagebreak paste print preview save searchreplace"],
      ["spellchecker table template textcolor wordcount visualblocks visualchars"]
    ],
    toolbar1: 'insertfile undo redo | styleselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | fontselect fontsizeselect',
    toolbar2: 'cut copy paste | blockquote removeformat subscript superscript | link image | print preview media | forecolor backcolor emoticons | code'
  });

  var dragging = false,
      dragTimeout;

  $('body').on({
    dragenter: function() {
      $(this).addClass('dragging');
      dragging = true;
    },
    dragover: function(e) {
      dragging = true;
      e.preventDefault();
    },
    dragleave: function() {
      dragging = false;
      clearTimeout(dragTimeout);
      dragTimeout = setTimeout(function() {
        if(!dragging) {
          $('body').removeClass('dragging');
        }
      }, 200);
    },
    drop: function(e) {
      $("body").removeClass('dragging');
      $('.drop_zone').removeClass('hover');
      e.preventDefault();
    }
  });

  $('input[type="file"]').each(function() {
    var $this = $(this),
        $text_input = $this.clone(),
        $previews_list = $this.closest('.upload_btn').siblings('.previews_list'),
        settings = $this.data('settings');

    $this.before($text_input.attr('type', 'hidden').removeAttr('data-settings'))
        .removeAttr('id')
        .attr('name', 'file_' + $this.attr('name'));

    $this.on('change', function() {
      var $input = $(this),
          files = $input[0].files;

      if(!files.length) {
        return;
      }
      if(!$this.is('[multiple]')) {
        $previews_list.find('img').remove();
      }
      for(var i = 0; i < files.length; i++) {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(files[i]);

        oFReader.onload = function(oFREvent) {
          $previews_list.append('<img src="'+ oFREvent.target.result +'" class="readerPreview">');
        };
      }

      sendFiles(files, {settings: settings}, function(err, uploadedFiles) {
        if(err) {
          return alert('err!');
        }
        if(settings.array) {
          var oldVal,
              newVal;

          try {
            oldVal = JSON.parse($text_input.val())
          } catch(e) {
            oldVal = [];
          }
          newVal = oldVal.concat(uploadedFiles);
          $text_input.val(JSON.stringify(newVal));
        } else {
          $text_input.val(JSON.stringify(uploadedFiles));
        }
        if(settings.preview) {
          $previews_list.find('.readerPreview').remove();
          if(!settings.array) {
            $previews_list.find('.item').remove();
          }
          if(_.isArray(uploadedFiles)) {
            uploadedFiles.forEach(function(image) {
              $previews_list.append('<div class="item"><img src="'+ image.preview +'"/><div class="del_image">x</div>');
            });
          } else {
            $previews_list.append('<div class="item"><img src="'+ uploadedFiles.preview +'"/><div class="del_image">x</div>');
          }
        }
      });
    });
  });

  $(document).on({
    dragover: function() {
      $(this).addClass('hover');
    },
    dragleave: function() {
      $(this).removeClass('hover');
    },
    drop: function(e) {
      var $this = $(this);
      sendFiles(e.originalEvent.dataTransfer.files, $this.find('input[type="file"]').data('settings'), function(err, paths) {
        $this.find('input[type="text"]').val(paths);
      });
      return false;
    }
  }, '.drop_zone');

  $(document).on('change', '.form_checkbox', function() {
    var $this = $(this),
        $hidden = $this.siblings('.hidden_checkbox');

    $hidden.val($this.is(':checked') ? '1' : '0');
  });

  $(document).on('click', '.previews_list .del_image', function() {
    var $this = $(this),
        $img = $this.siblings('img'),
        $input = $this.closest('.previews_list').siblings('.upload_btn').find('.image_field'),
        inputVal = JSON.parse($input.val()),
        newVal = _.reject(inputVal, {preview: $img.attr('src')});

    $input.attr('value', JSON.stringify(newVal));
    $this.closest('.item').remove();
  });

});

var sendFiles = function(files, options, callback) {
  if(!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }
  if(typeof callback !== 'function') {
    return false;
  }
  var collection = $('.admin_form').data('collection'),
      filesArray = Array.prototype.slice.call(files),
      formData = new FormData(),
      defer = $.Deferred(),
      urlQuery = {
        folder: collection,
        settings: options.settings
      },
      url = '/admin/upload?' + $.param(urlQuery);

  filesArray.forEach(function(file) {
    formData.append('file', file);
  });
  if(options.name) {
    formData.append('name', options.name);
  }

  var ajaxOptions = {
    url: url,
    data: formData,
    processData: false,
    contentType: false,
    cache: false,
    type: 'POST',
    success: function (data) {
      if(data.status == 200 && data.files) {
        if(options.settings.array) {
          if(_.isArray(data.files) && data.files.length > 1) {
            defer.resolve(data.files);
          } else {
            defer.resolve(data.files[0]);
          }
        } else {
          if(_.isArray(data.files) && data.files.length > 1) {
            defer.resolve(data.files);
          } else {
            defer.resolve(data.files[0]);
          }
        }
      } else {
        alert('Что-то пошло не так, отругайте программиста');
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

  defer.then(function(uploadedFiles) {
    callback(null, uploadedFiles);
  }).fail(function(err) {
    notyError(err);
    callback(err);
  });
};
