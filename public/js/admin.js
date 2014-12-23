
$(function() {

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
        $form_group = $this.closest('.form-group'),
        $text_input = $this.clone();

    $text_input.popover({
      html: true,
      placement: 'top',
      trigger: 'hover',
      content: function() {
        var val = $(this).val();
        if(val) {
          return '<div class="popover_image"><img src="'+ val +'"></div>';
        } else {
          return false;
        }
      }
    });
    $this.wrap('<div class="input-group"></div>');
    $this.before($text_input.attr('type', 'text'))
        .removeAttr('id')
        .attr('name', 'file_' + $this.attr('name'));

    $this.wrap('<div class="input-group-btn"><button type="button" class="btn btn-default upload_btn"></button></div>');
    $this.closest('.upload_btn').prepend('<span>Обзор...</span>');
    $form_group.addClass('drop_zone');
    $this.on('change', function() {
      var $input = $(this),
          files = $input[0].files;

      sendFiles(files, $this.data('settings'), function(paths) {
        $text_input.val(paths);
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
      sendFiles(e.originalEvent.dataTransfer.files, $this.find('input[type="file"]').data('settings'), function(paths) {
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


});


var sendFiles = function(files, options, callback) {
  if(!callback && typeof options === 'function') {
    callback = options;
    options = null;
  }
  if(typeof callback !== 'function') {
    return false;
  }
  var filesLength = files.length,
      collection = $('.admin_form').data('collection'),
      filePaths = [],
      promises = [];

  for (var i = 0; i < filesLength; i++) {
    (function(i) {
      var file = files[i],
          fd = new FormData(),
          urlQuery = {
            folder: collection,
            settings: options
          },
          url = '/admin/upload?' + $.param(urlQuery);

      fd.append('file', file);
      var defer = $.Deferred();
      $.ajax({
        url: url,
        data: fd,
        processData: false,
        contentType: false,
        cache: false,
        type: 'POST',
        success: function (data) {
          if(data.status == 200 && data.path) {
            defer.resolve(data.path);
          } else {
            alert('Что-то пошло не так, отругайте программиста');
          }
        }
      });
      promises.push(defer.promise());
    })(i);
  }
  $.when.apply($, promises).then(function() {
    for(var i = 0; i < arguments.length; i++) {
      filePaths.push(arguments[i]);
    }
    callback(filePaths.join(', '));
  });
};
