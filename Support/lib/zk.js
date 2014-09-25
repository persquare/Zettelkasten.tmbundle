function format_header(element, path) {
    var header = element.getElementsByTagName('p')[0]
    var text = header.innerHTML;
    header.innerHTML = '<div class="header"><p><a href="txmt://open?url=file://' + path + '">Edit…</a><p><pre class="header">'+text+'</pre></div>';
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
    if (url.substring(0,5) === 'zk://') {
      links[i].onclick = open_zk_link;  
    } else if (url.substring(0,7) !== 'txmt://') {
      links[i].innerHTML += '<img src="external.gif" />'
    }
  } 
}

function display_note(id) {
    var preview = document.getElementById('preview_pane')
    var path = notes[id][0]['_path']
    var obj = TextMate.system('"Markdown.pl" "' + path +'"', null);
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
    return a.filter(function (e) {
        if (b.indexOf(e) !== -1) return true;
    });
}

function filter_results(search) {
  // Process the search string here, then call sub-filters
  filter_by_tag(search);
}

function filter_by_id(search) {
	var str = search.value;
	var results = document.getElementById('results');
	var count = 0;
    // Simple filtering on ID example 
    for (var key in notes) {
        if (notes[key][0].ID.substring(0, str.length) === str) {
        	  count++;
			      document.getElementById(key).style.display = 'block';
            if (count == 1) {
                display_note(key);
            }
        } else {
			      document.getElementById(key).style.display = 'none';
        }
    }
	  results.innerHTML = (str) ? count + ' Found' : '';
}

function filter_by_tag(search) {
	var str = search.value;
  if (str === "" || intersect([str], tags).length == 0) {
      reset_list();
      return;
  }  
	var results = document.getElementById('results');
	var count = 0;
    // Filtering on tag
    for (var key in notes) {
        var note_tags = notes[key][0].Tags;
        if (intersect([str], note_tags).length > 0) {
          	count++;
            document.getElementById(key).style.display = 'block';
            if (count == 1) {
                display_note(key);
            }
        } else {
			      document.getElementById(key).style.display = 'none';
        }
    }
	  results.innerHTML = (str) ? count + ' Found' : '';
}

