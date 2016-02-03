
$.noty.defaults.timeout = 10000;

$(function() {

  $('.tinymce').tinymce({
    script_url: '/admin/public/bower_components/tinymce/tinymce.min.js',
    content_css : ['/admin/public/bower_components/bootstrap/dist/css/bootstrap.css', '/admin/public/bower_components/bootstrap/dist/css/bootstrap-theme.css'],
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
        .attr('name', 'file_' + $this.attr('name'))
        .removeClass('image_field')
        .attr('value', '');

    $this.on('change', function() {
      var $input = $(this),
          files = $input[0].files;

      if(!files.length) {
        return;
      }
      if(!$this.is('[multiple]')) {
        $previews_list.find('.item, .readerPreviewWrp').remove();
      }
      for(var i = 0; i < files.length; i++) {
        var oFReader = new FileReader();
        oFReader.readAsDataURL(files[i]);

        oFReader.onload = function(oFREvent) {
          $previews_list.append([
            '<div class="item readerPreviewWrp">',
              '<img src="'+ oFREvent.target.result +'" class="readerPreview">',
              '<div class="del_preview">x</div>',
            '</div>'
          ].join(''));
        };
      }

      sendFiles(files, {settings: settings, folder: 'media'}, function(err, data) {
        if(err) {
          return alert('err!');
        }

        var mediaArr = _.isArray(data.media) ? data.media : [data.media],
            uploadedIds = _.map(mediaArr, 'id');

        if(settings.array) {
          var oldVal,
              newVal;

          try {
            oldVal = $text_input.val().split(',');
          } catch(e) {
            oldVal = [];
          }
          newVal = _.compact(oldVal.concat(uploadedIds));
          $text_input.val(newVal.join(','));
        } else {
          $text_input.val(uploadedIds.join(','));
        }
        if(settings.previews) {
          var smallestPreview = function(previews) {
            return Object.keys(previews).sort()[0];
          };
          $previews_list.find('.readerPreviewWrp').remove();
          if(!settings.array) {
            $previews_list.find('.item').remove();
          }
          if(_.isArray(data.files)) {
            data.files.forEach(function(image) {
              $previews_list.append([
                '<div class="item">',
                  '<img src="'+ image.previews[smallestPreview(image.previews)].url +'" data-url="'+ image.url +'"/>',
                  '<div class="del_image">x</div>',
                '</div>',
              ''].join(''));
            });
          } else {
            $previews_list.append([
              '<div class="item">',
                '<img src="'+ data.files.previews[smallestPreview(data.files.previews)].url +'" data-url="'+ data.files.url +'"/>',
                '<div class="del_image">x</div>',
              '</div>',
            ''].join(''));
          }
        } else {
          $previews_list.find('.readerPreviewWrp').addClass('uploaded');
        }
      });
    });
  });

  $(document).on('click', '.readerPreviewWrp .del_preview', function() {
    var $readerPreviewWrp = $(this).closest('.readerPreviewWrp'),
        index = $readerPreviewWrp.index(),
        $previews_list = $readerPreviewWrp.closest('.previews_list'),
        $input = $previews_list.siblings('.upload_btn').find('.image_field'),
        inputVal = $input.val().split(',');

    inputVal.splice(index, 1);
    $input.val(_.compact(inputVal).join(','));
    $readerPreviewWrp.remove();
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
        originalUrl = $img.data('url'),
        newVal = _.reject(inputVal, {url: originalUrl});

    $input.attr('value', JSON.stringify(newVal));
    $this.closest('.item').remove();
  });

  $('.datepicker').datepicker({
    dateFormat: 'yy-mm-dd',
    changeMonth: true,
    changeYear: true,
    yearRange: '2014:2050',
    defaultDate: new Date()
  });

  $('.datetimepicker').datetimepicker({
    dateFormat: 'yy-mm-dd',
    timeFormat: 'HH:mm:ss',
    changeMonth: true,
    changeYear: true,
    yearRange: '2014:2050',
    defaultDate: new Date(),
    //addSliderAccess: true,
    //sliderAccessArgs: { touchonly: false }
  });

  $(document).on('click', '.postlink', function(e) {
    var $link = $(this);
    e.preventDefault();
    $.post($link.attr('href'), $link.data('postdata')).done(function() {
      document.location.reload();
    });
  });

  var $defaultInput = '';

  $(document).on('click', '.add_new_input', function() {
    var $inputs_list = $(this).siblings('.inputs_list');

    if($defaultInput.length) {
      $defaultInput = prepareClonedInput($defaultInput);
      $inputs_list.append($defaultInput.clone(true));
      return;
    }
    var $lastInput = $inputs_list.find('.input:last');

    $defaultInput = prepareClonedInput($lastInput.clone(true).find('input').val('').end());
    $inputs_list.append($defaultInput.clone(true));
  });

  $(document).on('click', '.delete', function() {
    if(!confirm('Вы уверены?')) {
      return false;
    }
  });

});

var prepareClonedInput = function($input) {
  return $input.find('input')
      .attr('name', $input.find('input').attr('name').replace(/(.[^\[]*)\[([0-9+])\]/, function(matched, name, num) {
        return name + '[' + (~~num + 1) + ']';
      }))
      .val('')
      .end();
};

var sendFiles = function(files, options, callback) {
  if(!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  if(typeof callback !== 'function') {
    return false;
  }
  var collection = $('.admin_form').data('collection'),
      filesArray = Array.prototype.slice.call(files),
      formData = new FormData(),
      defer = $.Deferred(),
      urlQuery = {
        folder: options.folder || collection,
        settings: options.settings
      },
      url = '/admin/upload?' + $.param(urlQuery);

  filesArray.forEach(function(file, index) {
    formData.append('file_' + index, file);
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
        if(_.isArray(data.files) && data.files.length > 1) {
          defer.resolve({files: data.files, media: data.media});
        } else {
          defer.resolve({files: data.files[0], media: data.media[0]});
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
