# Copyright (C) 2017 Baofeng Dong
# This program is released under the "MIT License".
# Please see the file COPYING in the source
# distribution of this software for license terms.


import os
import sys
import time
import json
from decimal import Decimal

from flask import make_response, Blueprint, redirect
from flask import url_for,render_template, jsonify, request
from sqlalchemy import func

from .helper import Helper
from dashboard import debug, error
from dashboard import Session as Session
from dashboard import app


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/introduction')
def intro():
    return render_template("introduction.html")

@app.route('/progress')
def progress():
    return render_template("progress.html")

@app.route('/results')
def result():
    return render_template("results.html")

@app.route('/map')
def map():
    return render_template("map.html")


@app.route('/map/_query', methods=['GET'])
def map_query():
    response = []
    where = ""
    args = request.args

    where = Helper.buildconditions(args)
    debug(where)
    response = Helper.query_map_data(where=where)

    return jsonify(data=response)