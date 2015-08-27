function format_header(element, path) {
  var header = element.getElementsByTagName('p')[0]
  var text = header.innerHTML;
  header.innerHTML = '<div class="header"><p><a href="txmt://open?url=file://' + path + '">Edit…</a><p><pre class="header">' + text + '</pre></div>';
}

function open_zk_link(element) {
  var id = this.href.substring(5)
  display_note(id);
  return false;
}

function mangle_links(element) {
  var links = element.getElementsByTagName('a');
  for (var i = 0; i < links.length; i++) {
    var url = links[i].href;
    if (url.substring(0, 5) === 'zk://') {
      links[i].onclick = open_zk_link;
    } else if (url.substring(0, 7) !== 'txmt://') {
      links[i].innerHTML += '<img src="external.gif" />'
    }
  }
}

function display_note(id) {
  var preview = document.getElementById('preview_pane')
  var path = notes[id]['_path']
  var obj = TextMate.system('"Markdown.pl" "' + path + '"', null);
  preview.innerHTML = obj.outputString
  format_header(preview, path);
  mangle_links(preview);
  highlight_item(id);
}

function highlight_item(id) {
  var count = 0;
  for (var key in notes) {
    var item = document.getElementById(key);
    if (id == item.id) {
      item.style.backgroundColor = '#dfebfe';
    } else {
      item.style.backgroundColor = 'inherit';
    }
  }
}

function reset_list() {
  var count = 0
  for (var key in notes) {
    count++
    document.getElementById(key).style.display = 'block'
    if (count == 1) {
      display_note(key)
    }
  }
}

// http://stackoverflow.com/a/16227294

function intersect(a, b) {
  var t;
  if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
  return a.filter(function(e) {
    if (b.indexOf(e) !== -1) return true;
  });
}

function parse_predicate(str) {
  // Check for tags (#)
  var tag_regex = /#(\w[\w\d_]*)/g;
  var tag_list = [];
  // http://stackoverflow.com/a/432503
  var match = tag_regex.exec(str);
  while (match != null) {
      tag_list.push(match[1]);
      var match = tag_regex.exec(str);
  }
  tag_list = intersect(tag_list, tags);
  // Check for id (@)
  var id_regex = /@(\d+)/g;
  var id = null;
  var match = id_regex.exec(str);
  if (match != null) {
      id = match[1];
  }
  // Check for freetext
  var text_regex = /([^#@\s]\w+)/g;
  var text = null;

  return {'id':id, 'tag_list':tag_list, 'text':text};
}

function filter_results(search) {
  // Process the search string here, then call sub-filters
  var str = search.value;
  if (str === "") {
    reset_list();
    return;
  } 
  var predicate = parse_predicate(str);
  // Just use an dict (starting with all entries = True) as input to each sub-filter
  var result = {};
  for (var key in notes) {
    result[key] = true;
  } 
  // Filter on all predicates
  if (predicate.tag_list.length > 0) {
    result = filter_by_tag(predicate.tag_list, result);
  }
  if (predicate.id != null) {
    result = filter_by_id(predicate.id, result);
  }
  if (predicate.text != null) {
    result = filter_by_text(predicate.text, result);
  }
  // Compute all results from the final list state, and generate output
  var count = 0;
  for (var key in result) {
    if (result[key]) {
      count++;
      document.getElementById(key).style.display = 'block';
      if (count == 1) {
        display_note(key);
      }
    } else {
      document.getElementById(key).style.display = 'none';
    }
  }
  document.getElementById('results').innerHTML = (str) ? count + ' Found' : '';
}

function filter_by_tag(tag_list, result) {
  for (var key in result) {
    if (!result[key]) {
      continue;
    }
    var note_tags = notes[key].Tags;
    if (intersect(tag_list, note_tags).length !== tag_list.length) {
      result[key] = false;
    }
  }
  return result;
}

function filter_by_id(id, result) {
  for (var key in result) {
    if (!result[key]) {
      continue;
    }
    var note_id = notes[key].ID;
    if (note_id.substring(0, id.length) !== id) {
      result[key] = false;
    }
  }
  return result;
}

function filter_by_text(text, result) {
  for (var key in result) {
    if (!result[key]) {
      continue;
    }
    var anfang = notes[key].Title;
    var text_regex = new RegExp(text, "gi");
    
    if (text_regex.exec(anfang) == null) {
      result[key] = false;
    }
  }
  return result;
}

function drag(ev) {
    ev.dataTransfer.setData("text", "zk://"+ev.target.parentElement.id+" \""+ev.target.innerHTML+"\"");
}

// See http://stackoverflow.com/a/19655662/1007047
function add_tag_click() {
  var classname = document.getElementsByClassName("tags");

  var filter_by_tag = function(event) {
    var word = getWordAtPoint(event.target, event.x, event.y)
    console.log(word);
    if(word === null) {
      return;
    }     
    event.preventDefault();
    event.stopPropagation();
    var search = document.getElementById("search");
    search.value = "#"+word;
    filter_results(search)
  };

  for(var i=0;i<classname.length;i++) {
    classname[i].addEventListener('click', filter_by_tag, false);
  }
}

// See http://stackoverflow.com/a/3710561/1007047
function getWordAtPoint(elem, x, y) {
  if(elem.nodeType == elem.TEXT_NODE) {
    var range = elem.ownerDocument.createRange();
    range.selectNodeContents(elem);
    var currentPos = 0;
    var endPos = range.endOffset;
    while(currentPos+1 < endPos) {
      range.setStart(elem, currentPos);
      range.setEnd(elem, currentPos+1);
      if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
         range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
        range.expand("word");
        var ret = range.toString();
        range.detach();
        return(ret);
      }
      currentPos += 1;
    }
  } else {
    for(var i = 0; i < elem.childNodes.length; i++) {
      var range = elem.childNodes[i].ownerDocument.createRange();
      range.selectNodeContents(elem.childNodes[i]);
      if(range.getBoundingClientRect().left <= x && range.getBoundingClientRect().right  >= x &&
         range.getBoundingClientRect().top  <= y && range.getBoundingClientRect().bottom >= y) {
        range.detach();
        return(getWordAtPoint(elem.childNodes[i], x, y));
      } else {
        range.detach();
      }
    }
  }
  return(null);
}
