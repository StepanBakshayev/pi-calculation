import logging
from pathlib import Path

import aiohttp_jinja2
import jinja2
from aiohttp import web
from sqlalchemy import create_engine, event, Column, Integer, String
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# XXX: Singletons. Singletons everywhere!

ROOT_PATH = Path(__file__).parent


@event.listens_for(Engine, 'connect')
def set_sqlite_pragma(dbapi_connection, connection_record):
	cursor = dbapi_connection.cursor()
	cursor.execute('PRAGMA journal_mode=WAL')
	cursor.close()


Base = declarative_base()


class Result(Base):
	__tablename__ = 'result'

	digit_number = Column(Integer, primary_key=True)
	number = Column(String)

	def __repr__(self):
		return 'Result(digit_number={self.digit_number!r}, number={self.number!r})'.format(self=self)


routes = web.RouteTableDef()
routes.static('/bootstrap', ROOT_PATH/'node_modules'/'bootstrap'/'dist', name='bootstrap')


@aiohttp_jinja2.template('index.html')
async def index(request):
	session = request.app['session']
	results = session.query(Result)
	return {'results': results, 'results_exists': session.query(results.exists()).scalar()}


def main():
	logging.basicConfig(level=logging.DEBUG)

	engine = create_engine('sqlite:///{!s}'.format(ROOT_PATH/'db.sqlite3'), echo=True)
	Base.metadata.create_all(engine)

	Session = sessionmaker()
	Session.configure(bind=engine)

	app = web.Application()
	app.add_routes(routes)
	app.router.add_route('*', '/', index)
	app['session'] = Session()

	with (ROOT_PATH / 'index.html').open('rt') as source:
		aiohttp_jinja2.setup(
			app,
			loader=jinja2.DictLoader({
				'index.html': source.read()}))

	web.run_app(app)


if __name__ == '__main__':
	main()
