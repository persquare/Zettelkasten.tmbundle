function format_header(element, path) {
    var header = element.getElementsByTagName('p')[0]
    var text = header.innerHTML;
    header.innerHTML = '<div class="header"><pre>'+text+'</pre><a href="txmt://open?url=file://' + path + '">Edit…</a></div>';
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
    var url_scheme = url.substring(0, 5);
    if (url_scheme === 'zk://') {
      links[i].onclick = open_zk_link;  
    }
  } 
}

function display_note(id) {
    var preview = document.getElementById('preview_pane')
    var path = notes[id][0]['_path']
    var obj = TextMate.system('"Markdown.pl" "' + path +'"', null);
    preview.innerHTML = obj.outputString
    format_header(preview, path);
    mangle_links(preview)
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

function filter_results(search) {
	var str = search.value
	var results = document.getElementById('results')
	var count = 0
    // Simple filtering on ID example 
    for (var key in notes) {
        if (notes[key][0].ID.substring(0, str.length) === str) {
        	count++
			document.getElementById(key).style.display = 'block'
            if (count == 1) {
                display_note(key)
            }
        } else {
			document.getElementById(key).style.display = 'none'
        }
    }
	results.innerHTML = (str) ? count + ' Found' : ''
}


