# demo-javascript-web

## solution
aims to drive a train arrivals board. it reads arrival prediction feeds, and signals when a train is due to arrive by making an announcement.

as no target hardware is available, for evaluation purposes, it dumps arrival info to a time-stamped file.

the solution runs as a backend service, periodically updating the raw arrivals data when its queue is empty, or, each minute where there are no pending arrivals. the solution also offers a RESTful web api to modify stoppoint/line ids and query the current arrivals queue.

## testing
run tests with
```
> jasmine
```
## usage

### service
run demo service through npm-script using:
```
> npm run demo
> npm run demo -- --help
```
and with alternative defaults:
```
> npm run demo -- -s "STOPPOINT_ID" -l "LINE_ID"
> npm run demo -- --stoppointid "STOPPOINT_ID" --lineid "LINE_ID"
```
alternatively directly with node using:
```
> node index
> node index -s "STOPPOINT_ID" -l "LINE_ID"
```
e.g
```
> node index -s "940GZZLUWLO" -l "bakerloo"
```
### api
you can use web urls (via browsers/curl etc.) to interact with the service:  

to get the following arrivals for current `stoppoint_id` / `line_id` combination:  

http://localhost/?arrivals  

to modify the current `stoppoint_id` and/or `line_id` ids:  

http://localhost/?stoppoint_id=940GZZLUWLO  
http://localhost/?line_id=bakerloo  
  
http://localhost/?stoppoint_id=940GZZLUWLO&line_id=bakerloo  

## configuration
a variety of service configuration options can be accessed by copying `config/default.yml.example` -> `config/default.yml` and modifying based on the following information:  

`default_stoppoint_id`  : this determines the default stoppoint-id when no option is passed by command-line argument on starting the service. e.g. `'940GZZLUWLO'`  
`default_line_id`  : this determines the default line-id when no option is passed by command-line argument on starting the service. e.g. `'bakerloo'`  
`request_errors_max`  : this determines the max number of retries before the service exits  when the raw data request fails. e.g. `2`  
`port`  : this determines what localhost port the service web api runs on e.g. `9000`  
`display_format`*  : determines the format of the string used to construct an arrival item for following arrivals. e.g. `'{platformName}\n{expectedArrival}: {lineName} -> {towards}  | {timeToStation}'`  
`announce_format`*  : determines the format of the string used to construct an announcement for an arrival. e.g. `'the train arriving at {platformName} is the {expectedArrival} {lineName} service towards {towards}'`  
`time_format`  : determines the format of the time string used for the expected arrival time. e.g. `'HH:mm'`  
`following_arrivals_max`  : determines the maximum number of following arrivals to be pushed each minute e.g. `5`  
  
*supported format keyword (to be surrounded with curly braces e.g. `{example}`) are:  
  
`expectedArrival` : the full UTC date/time of the expected arrival. e.g. `2018-07-08T07:47:53Z`  
`lineName`  : the full name of the tube line. e.g. `Bakerloo`  
`platformName`  : the name of the platform the arrival is due on. e.g. `Southbound - Platform 4`  
`destinationName`  : the full destination description. e.g. `Elephant & Castle Underground Station`  
`towards`  : e.g. the short destination description. e.g. `Elephant and Castle`  
`timeToStation`  : the time, in number of minutes (rounded up) to the arrival. e.g. `1min`  

## dependencies
- commander
- moment
- express
- config
- jasmine (dev)
- rewire (dev)

## data information
- line status, stops, journey planning, arrival predictions endpoints all readily available at:  
  https://api.tfl.gov.uk/  

- stoppoints lookup:  
  https://api.tfl.gov.uk/StopPoint/Mode/Tube  

- stoppoints per line lookup:  
  https://api.tfl.gov.uk/line/24/stoppoints  

- arrivals per stoppoint and line:  
  https://api.tfl.gov.uk/Line/bakerloo/Arrivals/940GZZLUWLO?direction=inbound  

- stoppoint/line examples:  
  Waterloo's Bakerloo Line [stoppoint-id: 940GZZLUWLO, line-id: bakerloo]  
  Earls Court's District Line [stoppoint-id: 490G00064A, line-id: piccadilly]  
  Gloucester Road's Circle Line [stoppoint-id: 940GZZLUGTR, line-id: circle]  

## todo:
- option to force period update (no accounting for stale data / new trains / delays etc. as it stands)
- map for numbers to words
- prefer inline promisification
- more tests

## done
- remove config use in lib module
- fix fixed timeToStation in following arrivals data
- document formatting
- display arrivals from web api call
- announcement / display formatting
- processing data
- add config module for port, default ids, max error etc.
- respond to incorrect ids without bringing service down
- fix npm run usage
- entry point
- command line arg parsing
- test stubs
- library stubs  
    - send_arrival(text)  
    - send_following_arrivals([list of text])  
