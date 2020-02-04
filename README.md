# Fastify Metrics-js Prometheus

A Fastify plugin for generating @metrics/client (https://www.npmjs.com/package/@metrics/client) route timing metrics.

## Usage

Step 1. Include and setup dependency

```js
const ResponseTiming = require('fastify-metrics-js-response-timing');
const reponseTiming = new ResponseTiming();
```

Step 2. Pipe metrics into a consumer. See [Metrics JS](https://www.npmjs.com/package/@metrics/client) for more on this.

```js
responseTiming.metrics.pipe(consumer);
```

Step 3. Create a fastify app and include the plugin

```js
const app = require('fastify')();
app.register(responseTiming.plugin());
```

Step 4. Opt out of any routes as needed by passing config to the route

```js
app.get('/', { config: { timing: false } }, (request, reply) => {
    reply.send('ok');
});
```

By default timing metrics will be gathered for all defined routes in the app unless you opt out. However, it is possible to set the plugin up to be opt in as shown below.

## Timing only desired routes

```js
const reponseTiming = new ResponseTiming({ timeAllRoutes: false });
app.register(responseTiming.plugin());

// opt in by setting timing config to true
app.get('/', { config: { timing: true } }, (request, reply) => {
    reply.send('ok');
});
```

## Timing all routes

```js
const reponseTiming = new ResponseTiming({ timeAllRoutes: true });
app.register(responseTiming.plugin());

// opt out by setting timing config to false
app.get('/', { config: { timing: false } }, (request, reply) => {
    reply.send('ok');
});
```

## Grouping status codes

```js
const reponseTiming = new ResponseTiming({ groupStatusCodes: true });
app.register(responseTiming.plugin());
```

All status codes in the range `200-299` will be captured as `2xx`, `300-399` as `3xx`, `400-499` as `4xx`, `500-599` as `5xx`.

## Plugin options

```js
app.register(pluginMetrics, { groupStatusCodes });
```

| name             | description                                            | type      | default | required |
| ---------------- | ------------------------------------------------------ | --------- | ------- | -------- |
| groupStatusCodes | Whether to group status codes eg. 400, 401, 403 => 4xx | `boolean` | `false` | `no`     |
| timeAllRoutes    | Whether to time all routes or just those configured    | `boolean` | `true`  | `no`     |
