# demo-javascript-web

## solution
aiming to drive arrivals board hardware. need to read arrival prediction feeds, and signal when a train is due to arrive by making an announcement. 

for test purposes, dump required arrival info to a timestamped file.

## testing
run tests with

  > jasmine

## usage

run demo through npm-script using:

  > npm run demo -- -s "STOPPOINT_ID" -l "LINE_ID"
  > npm run demo -- --stoppointid "STOPPOINT_ID" --lineid "LINE_ID"
  > npm run demo -- --help

alternatively directly with node using:
  > node index -s "STOPPOINT_ID" -l "LINE_ID"

e.g
  > node index -s "940GZZLUWLO" -l "bakerloo"

## dependencies
- jasmine
- commander
- moment

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

# done
- fix npm run usage
- entry point
- command line arg parsing
- test stubs
- library stubs
 - send_arrival(text)
 - send_following_arrivals([list of text])

