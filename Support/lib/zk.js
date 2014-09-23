function format_header(element, path) {
    var header = element.getElementsByTagName('p')[0]
    var text = header.innerHTML;
    header.innerHTML = '<div class="header"><pre>'+text+'</pre><a href="txmt://open?url=file://' + path + '">Edit…</a></div>';
}

function display_note(id) {
    var preview = document.getElementById('preview_pane')
    var path = notes[id][0]['_path']
    var obj = TextMate.system('"Markdown.pl" "' + path +'"', null);
    preview.innerHTML = obj.outputString
    format_header(preview, path);
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
        } else {
			document.getElementById(key).style.display = 'none'
        }
    }
	results.innerHTML = (str) ? count + ' Found' : ''
}


