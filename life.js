(function () {
	'use strict'

	let domready = Promise.resolve()
	if (document.readyState === 'loading') {
		domready = new Promise(function (resolve, reject) {
			document.addEventListener('DOMContentLoaded', resolve)})}


	function onmessage(controlView, tableView, event) {
		const data = JSON.parse(event.data)
		render(controlView, tableView, data)}


	function renderTemplate(event) {
		event.target.removeEventListener('message', renderTemplate)

		const $tableContainer = document.getElementById('table')
		while ($tableContainer.firstChild)
			$tableContainer.removeChild($tableContainer.firstChild)
		const tableView = Monkberry.render(table, $tableContainer)

		const $controlContainer = document.getElementById('control')
		while ($controlContainer.firstChild)
			$controlContainer.removeChild($controlContainer.firstChild)
		const controlView = Monkberry.render(control, $controlContainer);

		onmessage(controlView, tableView, event)
		event.target.addEventListener('message', onmessage.bind(null, controlView, tableView))}


	function render(controlView, tableView, results) {
		// XXX: https://github.com/antonmedv/monkberry/issues/36
		for (const item of results)
			if (item.result === null)
				item.result = ''
		const next_digit_number = results[0].digit_number + 1
		controlView.update({'next_digit_number': next_digit_number})
		tableView.update({'results': results})}


	domready.then(function () {
		// XXX: Last second hack. There is no table for empty database
		if (document.getElementById('table') === null) {
			document.body.removeEventListener('submit', run)
			return}

		const ws = new WebSocket("ws://localhost:8080/subscribe");
		ws.addEventListener('message', renderTemplate)})


	function run(event) {
		const target = event.target
		if (!'parentElement' in target || !target.parentElement.matches('#control'))
			return;
		event.preventDefault()
		const request = new Request('/run', {
			method: 'POST',
			headers: new Headers({
				'X-REQUESTED-WITH': 'XMLHttpRequest'}),
			credentials: 'same-origin',
			body: new FormData(target)})
		fetch(request)}

	document.body.addEventListener('submit', run)

})()
