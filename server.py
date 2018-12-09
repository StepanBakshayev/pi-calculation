import logging
import signal
from itertools import chain
from multiprocessing import Pool, Process, Queue
from pathlib import Path
from queue import Empty

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


# XXX: WTF! Pool catch KeyboardInterrupt and block daemon
def init_worker():
	signal.signal(signal.SIGINT, signal.SIG_IGN)


def daemon(task_queue, engine):
	Session = sessionmaker()
	Session.configure(bind=engine)
	session = Session()

	with Pool(initializer=init_worker) as p:
		while True:
			try:
				digit_number = task_queue.get()
			except KeyboardInterrupt:
				break
			r = Result(digit_number=digit_number, number='NotImplemented')
			session.add(r)
			session.commit()


routes = web.RouteTableDef()
routes.static('/bootstrap', ROOT_PATH/'node_modules'/'bootstrap'/'dist', name='bootstrap')


@aiohttp_jinja2.template('index.html')
async def index(request):
	session = request.app['session']
	results = session.query(Result).order_by(-Result.digit_number)
	results_exists = session.query(results.exists()).scalar()
	next_digit_number = 1
	if results_exists:
		results = iter(results)
		first = next(results)
		next_digit_number = first.digit_number + 1
		results = chain((first,), results)

	if request.method == 'POST':
		data = await request.post()
		request_digit_number = None
		try:
			request_digit_number = int(data['next_digit_number'])
		except ValueError:
			pass

		if request_digit_number is not None and request_digit_number >= next_digit_number:
			request.app['task_queue'].put_nowait(request_digit_number)

		raise web.HTTPFound(request.path)


	return {
		'next_digit_number': next_digit_number,
		'results_exists': results_exists,
		'results': results}


def main():
	logging.basicConfig(level=logging.DEBUG)

	engine = create_engine('sqlite:///{!s}'.format(ROOT_PATH/'db.sqlite3'), echo=True)
	Base.metadata.create_all(engine)

	Session = sessionmaker()
	Session.configure(bind=engine)

	task_queue = Queue()
	background = Process(target=daemon, args=(task_queue, engine))
	background.start()

	app = web.Application()
	app.add_routes(routes)
	app.router.add_route('*', '/', index)
	app['session'] = Session()
	app['task_queue'] = task_queue

	with (ROOT_PATH / 'index.html').open('rt') as source:
		aiohttp_jinja2.setup(
			app,
			loader=jinja2.DictLoader({
				'index.html': source.read()}))

	try:
		web.run_app(app)

	finally:
		task_queue.close()
		task_queue.join_thread()
		background.join()


if __name__ == '__main__':
	main()
