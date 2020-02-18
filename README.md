# mediasoup-pipe-to-router-example

See also https://mediasoup.org/documentation/v3/scalability/

## Strategy

- If host has 8 cpu cores
  - Create 1 worker+router for publish
  - Create 7 worker+router for subscribe
- Each producing will be routed by `pipeToRouter()` API
  - w/ publish router
- Each consuming will be done on randomly picked transport
  - w/ subscribe router

## Try
```sh
# server
cd server && npm start

# sender
cd sender && npm start

# recver
cd recver && npm start
```
