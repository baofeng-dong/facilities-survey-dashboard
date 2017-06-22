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
    def query_map_data(where, csv):
        ret_val = []
        query_args = {}
        where = where
        csv = csv
        debug(csv)

        not_null = " location is not null AND manager_supervisor is not null "

        if csv == "yes":
            # add headers to csv data
            ret_val.append(
                ['date', 'time', 'manager','region', 'shelterid', 'location_lat', 'location_lng', 'litter', 'graffiti', 'washed',
                'roof', 'glass', 'bench', 'trashcan', 'lid', 'trashcangraffiti', 'repair', 'comments'])

        query_string = """
            SELECT 
                to_char(createdate, 'Mon DD YYYY') as _date,
                cast(createdate as time),
                manager_supervisor as manager,
                contractregion as region,
                case
                    WHEN shelterid = 'None' or shelterid = '' THEN '1234'
                    else shelterid
                end as shelterid,
                location,
                coalesce(nolitter, '') as litter,
                coalesce(nograffiti, '') as graffiti,
                coalesce(pressurewashed, '') as washed,
                coalesce(roofclean, '') as roof,
                coalesce(glassdried, '') as glass,
                coalesce(benchdried, '') as bench,
                coalesce(trashcanempty, '') as trashcan,
                coalesce(lidclean, '') as lid,
                coalesce(trashcangraffiti, ''),
                case
                    WHEN needrepair = 'true' THEN 'Yes'
                    WHEN needrepair = 'false' THEN 'No'
                    else                           ''
                end as repair,
                coalesce(comments, '')
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
            if csv == "yes":
                data = []
                data.append(str(record[DATE]))
                data.append(str(record[TIME]))
                data.append(record[MANAGER])
                data.append(record[REGION])
                data.append(record[SHELTER])
                data.append(record[LOCATION])
                data.append(record[LITTER])
                data.append(record[GRAFFITI])
                data.append(record[WASHED])
                data.append(record[ROOF])
                data.append(record[GLASS])
                data.append(record[BENCH])
                data.append(record[TRASHCAN])
                data.append(record[LID])
                data.append(record[TRASHCANGRAFFITI])
                data.append(record[REPAIR])
                data.append(record[COMMENTS])
            else:
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
    def query_station_data(where):
        ret_val = []
        query_args = {}
        where = where

        not_null = " platform is not null AND inspector is not null "

        query_string = """
            SELECT 
                to_char(createdate, 'Mon DD YYYY') as _date,
                cast(createdate as time),
                inspector,
                cleaningcrew as crew,
                washcrew,
                platform as station,
                coalesce(bathroom_cleaned, ''),
                coalesce(bathroom_stocked, ''),
                coalesce(bench_handrail_phone_tvm_cleaned, '') as bench,
                coalesce(crew_room_cleaned, ''),
                coalesce(electric_panel_cleaned, '') as electric,
                coalesce(parking_lot_notrash, '') as lot_notrash,
                coalesce(platform_cleaned, ''),
                coalesce(platform_hosedoff, ''),
                coalesce(shelter_area_hosed_down, '') as shelter_hosed,
                coalesce(shelter_enclosure_swept, '') as swept,
                coalesce(track_area_no_litter, '') as track_nolitter,
                coalesce(trash_emptied, ''),
                coalesce(landscaping_notrash, ''),
                coalesce(walk_pathway_notrash, '') as path_notrash,
                coalesce(platform_novegetation, ''),
                coalesce(comments, '')
            from max_platform_inspection """

        query_string += " WHERE "
        query_string += not_null
        query_string += where

        debug(query_string)

        web_session = Session()
        query = web_session.execute(query_string)

        DATE = 0
        TIME = 1
        INSPECTOR = 2
        CREW = 3
        WASH = 4
        STATION = 5
        BRCLEANED =6
        BRSTOCKED = 7
        BENCH = 8
        CREWROOM = 9
        ELECTRIC = 10
        LOTNOTRASH = 11
        PLATFORM_CLEANED = 12
        PLATFORMHOSED = 13
        SHELTERHOSED = 14
        SWEPT = 15
        TRACKLITTER = 16
        TRASHEMPTIED = 17
        LANDSCAPING = 18
        PATHNOTRASH = 19
        VEGETATION = 20
        COMMENTS = 21

        # each record will be converted as json
        # and sent back to page
        for record in query:

            data = {}
            data['date'] = str(record[DATE])
            data['time'] = str(record[TIME])
            data['inspector'] = record[INSPECTOR]
            data['crew'] = record[CREW]
            data['wash'] = record[WASH]
            data['station'] = record[STATION]
            data['bathroom_cleaned'] = record[BRCLEANED]
            data['bathroom_stocked'] = record[BRSTOCKED]
            data['bench_cleaned'] = record[BENCH]
            data['crew_room'] = record[CREWROOM]
            data['electric'] = record[ELECTRIC]
            data['lot_notrash'] = record[BENCH]
            data['platform_cleaned'] = record[PLATFORM_CLEANED]
            data['platform_hosed'] = record[PLATFORMHOSED]
            data['shelter_hosed'] = record[SHELTERHOSED]
            data['swept'] = record[SWEPT]
            data['track_litter'] = record[TRACKLITTER]
            data['trash_empied'] = record[TRASHEMPTIED]
            data['landscaping'] = record[LANDSCAPING]
            data['pathway_trash'] = record[PATHNOTRASH]
            data['vegetation'] = record[VEGETATION]
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
