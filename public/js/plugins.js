
function getInternetExplorerVersion() {
  var rv = -1,
      ua = navigator.userAgent,
      re;

  if(navigator.appName == 'Microsoft Internet Explorer') {
    re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
    if(re.exec(ua) != null) {
      rv = parseFloat(RegExp.$1);
    }
  } else if(navigator.appName == 'Netscape') {
    re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
    if(re.exec(ua) != null) {
      rv = parseFloat(RegExp.$1);
    }
  }

  return rv;
}

var IEVersion = getInternetExplorerVersion();

var notySuccess = function(text) {
      noty({
        type: 'success',
        text: text || 'Успех!'
      });
    },
    notyError = function(text) {
      noty({
        type: 'error',
        text: text || 'Что-то пошло не так...'
      });
    },
    notyAlert = function(text) {
      if(!text) {
        return false;
      }
      noty({
        type: 'alert',
        text: text
      });
    };

function strip_tags(input, allowed) {
  allowed = (((allowed || '') + '')
      .toLowerCase()
      .match(/<[a-z][a-z0-9]*>/g) || [])
      .join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)

  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
      commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

  return input.replace(commentsAndPhpTags, '')
      .replace(tags, function($0, $1) {
        return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
      });
}
