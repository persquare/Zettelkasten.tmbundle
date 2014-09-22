function display_note(id) {
    preview = document.getElementById('preview_pane')
    path = notes[id][0]['_path']
    obj = TextMate.system('"Markdown.pl" "' + path +'"', null);
    preview.innerHTML = obj.outputString
}

function filter_results(search) {
	str = search.value
	results = document.getElementById('results')
	count = 0
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


