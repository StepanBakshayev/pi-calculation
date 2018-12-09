import logging
from decimal import Decimal, getcontext
from itertools import chain
from math import factorial
from multiprocessing import Process, Queue
from pathlib import Path

import aiohttp_jinja2
import jinja2
from aiohttp import web
from sqlalchemy import create_engine, event, Column, Integer, String
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError
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


# XXX: Copy-pasted from http://blog.recursiveprocess.com/2013/03/14/calculate-pi-with-python/
def chudnovsky(n): #http://en.wikipedia.org/wiki/Chudnovsky_algorithm
	getcontext().prec = n + 100
	pi = Decimal(0)
	k = 0
	while k < n:
		pi += (Decimal(-1)**k)*(Decimal(factorial(6*k))/((factorial(k)**3)*(factorial(3*k)))*(13591409+545140134*k)/(640320**(3*k)))
		k += 1
	pi = pi * Decimal(10005).sqrt()/4270934400
	pi = pi**(-1)
	return pi


# XXX: WTF! Pool catch KeyboardInterrupt and block daemon
# def init_worker():
# 	signal.signal(signal.SIGINT, signal.SIG_IGN)


def daemon(task_queue, engine):
	Session = sessionmaker()
	Session.configure(bind=engine)
	session = Session()

	while True:
		try:
			digit_number = task_queue.get()
		except KeyboardInterrupt:
			break
		template = '{{:.{:d}}}'.format(digit_number+1)
		try:
			number = template.format(chudnovsky(digit_number))
		except Exception as e:
			number = repr(e)
		r = Result(digit_number=digit_number, number=number)
		session.add(r)
		try:
			session.commit()
			session.expunge_all()

		except IntegrityError:
			session.rollback()


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
			try:
				request.app['task_queue'].put(request_digit_number, timeout=1)
			except Exception as e:
				pass

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
