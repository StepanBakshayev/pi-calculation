(function () {
	'use strict'

	let domready = Promise.resolve()
	if (document.readyState === 'loading') {
		domready = new Promise(function (resolve, reject) {
			document.addEventListener('DOMContentLoaded', resolve)
		})
	}


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
		const next_digit_number = results[0].digit_number
		controlView.update({'next_digit_number': next_digit_number})
		tableView.update({'results': results})}


	domready.then(function () {
		const ws = new WebSocket("ws://localhost:8080/subscribe");
		ws.addEventListener('message', renderTemplate)})

})()
