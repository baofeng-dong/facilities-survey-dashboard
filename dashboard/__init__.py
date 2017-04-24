# Copyright (C) 2017 Baofeng Dong
# This program is released under the "MIT License".
# Please see the file COPYING in the source
# distribution of this software for license terms.


from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


app = Flask(__name__)
app.config.from_object('config')
app.debug = True
db = SQLAlchemy(app)

engine = create_engine(app.config['FACILITIES_DATABASE'])
Session = scoped_session(sessionmaker(bind=engine))

# make debug and error logging easier
debug = app.logger.debug
error = app.logger.error




from dashboard import views
