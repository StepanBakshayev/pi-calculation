(function () {
	'use strict'
//	const controlView = Monkberry.render(control, document.body);

	let domready = Promise.resolve()
	if (document.readyState === 'loading') {
		domready = new Promise(function (resolve, reject) {
			document.addEventListener('DOMContentLoaded', resolve)
		})
	}

	function onmessage(tableView, event) {
		const data = JSON.parse(event.data)
		render(tableView, data)}

	domready.then(function () {
		const $container = document.getElementById('table')
		while ($container.firstChild) {
    $container.removeChild($container.firstChild);
}
		const tableView = Monkberry.render(table, $container);
		const ws = new WebSocket("ws://localhost:8080/subscribe");
		ws.addEventListener(
			'message',
			onmessage.bind(null, tableView))})

	function render(tableView, results) {
		// XXX: https://github.com/antonmedv/monkberry/issues/36
		for (const item of results)
			if (item.result === null)
				item.result = ''
		tableView.update({'results': results})}

})()
