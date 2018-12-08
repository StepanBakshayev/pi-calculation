import logging
from pathlib import Path

import aiohttp_jinja2
import jinja2
from aiohttp import web

# XXX: Singletons. Singletons everywhere!

ROOT_PATH = Path(__file__).parent

routes = web.RouteTableDef()
routes.static('/bootstrap', ROOT_PATH / 'node_modules' / 'bootstrap' / 'dist', name='bootstrap')


@routes.get('/')
@aiohttp_jinja2.template('index.html')
async def hello(request):
	return {}


logging.basicConfig(level=logging.DEBUG)


app = web.Application()
app.add_routes(routes)

with (ROOT_PATH / 'index.html').open('rt') as source:
	aiohttp_jinja2.setup(
		app,
		loader=jinja2.DictLoader({
			'index.html': source.read()}))

web.run_app(app)

