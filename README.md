# demo-javascript-web

## solution
-drive arrivals board hardware
--read arrival prediction feeds
--signal when a train is due to arrive
---make announcement
--dump arrival info: 

## dependencies
-jasmine
-commander
-moment

## data
-line status, stops, journey planning, arrival predictions

-stop points
https://api.tfl.gov.uk/line/24/stoppoints

-arrivals e.g.
with StopPoint ID: 940GZZLUWLO
https://api.tfl.gov.uk/Line/bakerloo/Arrivals/940GZZLUWLO?direction=inbound

# todo:
-command arg parsing
-testing (jasmine)

# done
-entry point
-test stubs
-library stubs
--send_arrival(text)
--send_following_arrivals([list of text])


