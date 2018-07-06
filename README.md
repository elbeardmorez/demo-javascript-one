# demo-javascript-web

## solution
aiming to drive arrivals board hardware. need to read arrival prediction feeds, and signal when a train is due to arrive by making an announcement. 

for test purposes, dump required arrival info to a timestamped file.

solution runs a service with a REST api to query arrival(s) by `STOPPOINT_ID` and `LINE_ID`.

## testing
run tests with

  > jasmine

## usage

### service
run demo service through npm-script using:

  > npm run demo
  > npm run demo -- --help

and with alternative defaults

  > npm run demo -- -s "STOPPOINT_ID" -l "LINE_ID"
  > npm run demo -- --stoppointid "STOPPOINT_ID" --lineid "LINE_ID"

alternatively directly with node using:

  > node index
  > node index -s "STOPPOINT_ID" -l "LINE_ID"

e.g
  > node index -s "940GZZLUWLO" -l "bakerloo"

### api
web urls accessible via browsers / curl etc.

to get arrival for current default `stoppoint_id` / `line_id` combiation

  http://localhost/?arrival

to update `stoppoint_id` and/or `line_id`

  http://localhost/?stoppoint_id=940GZZLUWLO
  http://localhost/?line_id=bakerloo

or

  http://localhost/?stoppoint_id=940GZZLUWLO&line_id=bakerloo

## dependencies
- jasmine
- commander
- moment
- express

## data information
-line status, stops, journey planning, arrival predictions

-stop points
  https://api.tfl.gov.uk/line/24/stoppoints

-arrivals e.g.
with StopPoint ID: 940GZZLUWLO
  https://api.tfl.gov.uk/Line/bakerloo/Arrivals/940GZZLUWLO?direction=inbound

# todo:
- processing data
- more tests
- config module for poll, port, default ids etc.

# done
- respond to incorrect ids without bringing service down
- fix npm run usage
- entry point
- command line arg parsing
- test stubs
- library stubs
 - send_arrival(text)
 - send_following_arrivals([list of text])

