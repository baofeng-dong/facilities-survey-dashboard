# Copyright (C) 2017 Baofeng Dong
# This program is released under the "MIT License".
# Please see the file COPYING in the source
# distribution of this software for license terms.


import csv, os
from sqlalchemy import func, desc, distinct, cast, Integer
from flask import current_app, jsonify

from dashboard import Session as Session
from dashboard import debug, app, db
import simplejson as json
import pygal

app = current_app

DIRPATH = os.path.dirname(os.path.realpath(__file__))

class Helper(object):

    @staticmethod
    def query_map_data(where):
        ret_val = []
        query_args = {}
        where = where

        not_null = " location is not null AND manager_supervisor is not null "

        query_string = """
            SELECT 
                to_char(createdate, 'Mon DD YYYY') as _date,
                cast(createdate as time),
                manager_supervisor as manager,
                contractregion as region,
                shelterid,
                location,
                nolitter as litter,
                nograffiti as graffiti,
                pressurewashed as washed,
                roofclean as roof,
                glassdried as glass,
                benchdried as bench,
                trashcanempty as trashcan,
                lidclean as lid,
                trashcangraffiti,
                needrepair as repair,
                comments
            from bus_shelter_inspection """

        query_string += " WHERE "
        query_string += not_null
        query_string += where

        debug(query_string)

        web_session = Session()
        query = web_session.execute(query_string)

        DATE = 0
        TIME = 1
        MANAGER = 2
        REGION = 3
        SHELTER = 4
        LOCATION = 5
        LITTER =6
        GRAFFITI = 7
        WASHED = 8
        ROOF = 9
        GLASS = 10
        BENCH = 11
        TRASHCAN = 12
        LID = 13
        TRASHCANGRAFFITI = 14
        REPAIR = 15
        COMMENTS = 16

        # each record will be converted as json
        # and sent back to page
        for record in query:

            data = {}
            data['date'] = str(record[DATE])
            data['time'] = str(record[TIME])
            data['manager'] = record[MANAGER]
            data['region'] = record[REGION]
            data['shelter'] = record[SHELTER]
            data['location'] = record[LOCATION]
            data['litter'] = record[LITTER]
            data['graffiti'] = record[GRAFFITI]
            data['washed'] = record[WASHED]
            data['roof'] = record[ROOF]
            data['glass'] = record[GLASS]
            data['bench'] = record[BENCH]
            data['trashcan'] = record[TRASHCAN]
            data['lid'] = record[LID]
            data['trashcangraffiti'] = record[TRASHCANGRAFFITI]
            data['repair'] = record[REPAIR]
            data['comments'] = record[COMMENTS]

            ret_val.append(data)
        web_session.close()
        return ret_val

    @staticmethod
    def buildconditions(args):
        where = ""
        lookupwd = {
        "Weekday": "(1,2,3,4,5)",
        "Weekend": "(0,6)",
        "Saturday": "(6)",
        "Sunday": "(0)"
        }

        lookuprepair = {
        "Yes": "true",
        "No": "false"
        }

        lookupvehicle = {
        "MAX": "IN ('90','100','190','200','290')",
        "WES": "IN ('203')",
        "Bus": "NOT IN ('90','100','190','200','290','203')"
        }

        lookuprtetype = {
        "MAX": "1",
        "Bus Crosstown": "2",
        "Bus Eastside Feeder": "3",
        "Bus Westside Feeder": "4",
        "Bus Radial": "5",
        "WES": "6"
        }

        for key, value in args.items():
            # app.logger.debug(key,value)
            if not value: continue

            if key == "manager" and value:
                where += " AND manager_supervisor='{0}'".format(value)

            if key == "region" and value:
                where += " AND contractregion='{0}'".format(value)

            if key == "repair":
                where += " AND needrepair='{0}'".format(lookuprepair[value])

            if key == "start" and value:
                where += " AND date(createdate)>='{0}'".format(value)

            if key == "end" and value:
                where += " AND date(createdate)<='{0}'".format(value)

        return where
