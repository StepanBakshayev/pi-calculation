import logging
from decimal import Decimal, getcontext
from enum import Enum
from itertools import chain
from math import factorial
from multiprocessing import Process, Queue, cpu_count
from pathlib import Path

import aiohttp_jinja2
import jinja2
from aiohttp import web
from sqlalchemy import create_engine, event, Column, types, UniqueConstraint, Index, ForeignKey
from sqlalchemy.engine import Engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

# XXX: Singletons. Singletons everywhere!

ROOT_PATH = Path(__file__).parent


@event.listens_for(Engine, 'connect')
def set_sqlite_pragma(dbapi_connection, connection_record):
	cursor = dbapi_connection.cursor()
	cursor.execute('PRAGMA journal_mode=WAL')
	cursor.close()


Base = declarative_base()


class DigitNumber(Base):
	__tablename__ = 'digit_number'

	digit_number = Column(types.Integer, primary_key=True)

	def __repr__(self):
		return 'DigitNumber(digit_number={self.digit_number!r})'.format(self=self)


Progress = Enum('Progress', 'registered scheduled taken calculated stored', module=__name__)


class Event(Base):
	__tablename__ = 'event'

	id = Column(types.Integer, primary_key=True)
	digit_number = Column(types.Integer, ForeignKey(DigitNumber.digit_number))
	progress = Column(types.SmallInteger)
	result = Column(types.String, default=None)

	__table_args__ = UniqueConstraint('digit_number', 'progress'),


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


def worker(task_queue, engine):
	Session = sessionmaker()
	Session.configure(bind=engine)
	session = Session()

	while True:
		try:
			digit_number = task_queue.get()
		except KeyboardInterrupt:
			break

		session.add(Event(
			digit_number=digit_number,
			progress=Progress.taken.value))
		try:
			session.commit()
		except IntegrityError:
			session.rollback()
			continue

		try:
			template = '{{:.{:d}}}'.format(digit_number+1)
			number = template.format(chudnovsky(digit_number))
			calculated_error = None
		except Exception as e:
			calculated_error = repr(e)

		session.add(Event(
			digit_number=digit_number,
			progress=Progress.calculated.value,
			result=calculated_error))

		if calculated_error is None:
			session.add(Event(
				digit_number=digit_number,
				progress=Progress.stored.value,
				result=number))

		session.commit()


routes = web.RouteTableDef()
routes.static('/bootstrap', ROOT_PATH/'node_modules'/'bootstrap'/'dist', name='bootstrap')


@aiohttp_jinja2.template('index.html')
async def index(request):
	session = request.app['session']
	results = (session
		.query(DigitNumber.digit_number, Event.progress, Event.result)
		.join(Event)
		.group_by(DigitNumber)
		.order_by(-DigitNumber.digit_number, -Event.progress))
	results_exists = session.query(results.exists()).scalar()
	next_digit_number = 1
	if results_exists:
		results = iter(results)
		first = next(results)
		next_digit_number = first[0] + 1
		results = chain((first,), results)

	if request.method == 'POST':
		data = await request.post()
		request_digit_number = None
		try:
			request_digit_number = int(data['next_digit_number'])
		except ValueError:
			pass

		if request_digit_number is not None and request_digit_number >= next_digit_number:
			session.add(DigitNumber(digit_number=request_digit_number))
			session.add(Event(
				digit_number=request_digit_number,
				progress=Progress.registered.value))

			try:
				session.commit()
			except IntegrityError:
				session.rollback()

			else:
				try:
					request.app['task_queue'].put(request_digit_number, timeout=1)
					scheduled_error = None
				except Exception as e:
					scheduled_error = repr(e)

				session.add(Event(
					digit_number=request_digit_number,
					progress=Progress.scheduled.value,
					result=scheduled_error))
				session.commit()

		raise web.HTTPFound(request.path)

	return {
		'next_digit_number': next_digit_number,
		'results_exists': results_exists,
		'results': results,
		'Progress': Progress}


def main():
	logging.basicConfig(level=logging.DEBUG)

	engine = create_engine('sqlite:///{!s}'.format(ROOT_PATH/'db.sqlite3'), echo=True)
	Base.metadata.create_all(engine)

	Session = sessionmaker()
	Session.configure(bind=engine)

	task_queue = Queue()
	workers = []
	for _ in range(cpu_count()):
		background = Process(target=worker, args=(task_queue, engine))
		background.start()
		workers.append(background)

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
		for background in workers:
			background.join()


if __name__ == '__main__':
	main()
