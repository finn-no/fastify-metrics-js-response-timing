'use strict';

const { test } = require('tap');
const fastify = require('fastify');
const supertest = require('supertest');
const Plugin = require('./index');

test('timeAllRoutes = false: No metrics are generated when route url config is not explicitly defined', async t => {
    const app = fastify();
    const plugin = new Plugin({ timeAllRoutes: false });
    app.register(plugin.plugin());
    app.get('/my-route', (request, reply) => {
        reply.send('');
    });
    const address = await app.listen();

    const buffer = [];

    plugin.metrics.on('data', metric => {
        buffer.push(metric);
    });

    plugin.metrics.on('end', () => {
        t.equal(buffer.length, 0);
        t.end();
    });

    const http = supertest(address);
    await http.get('/my-route');

    plugin.metrics.push(null);

    await app.close();
});

test('timeAllRoutes = false: Plugin generates expected histogram metric for route when timing config is set to true', async t => {
    const app = fastify();
    const plugin = new Plugin({ timeAllRoutes: false });
    app.register(plugin.plugin());
    app.get(
        '/my-route/:dynamic',
        { config: { timing: true } },
        (request, reply) => {
            reply.send('');
        },
    );
    const address = await app.listen();

    const buffer = [];

    plugin.metrics.on('data', metric => {
        buffer.push(metric);
    });

    plugin.metrics.on('end', () => {
        t.equal(buffer.length, 1);
        t.equal(
            buffer[0].name,
            'http_request_duration_seconds',
            'metric name should match metric stream object',
        );
        t.equal(
            buffer[0].description,
            'App route response time',
            'metric description should match metric stream object',
        );
        t.equal(
            buffer[0].type,
            5,
            'metric type should match metric stream object',
        );
        t.same(
            buffer[0].labels,
            [
                { name: 'method', value: 'GET' },
                { name: 'url', value: '/my-route/:dynamic' },
                { name: 'status_code', value: '200' },
            ],
            'generated labels object should match metric stream object',
        );
        t.end();
    });

    const http = supertest(address);
    await http.get('/my-route/1');

    plugin.metrics.push(null);

    await app.close();
});

test('timeAllRoutes = true: Metrics are generated when route url config is not explicitly defined', async t => {
    const app = fastify();
    const plugin = new Plugin({ timeAllRoutes: true, groupStatusCodes: true });
    app.register(plugin.plugin());
    app.get('/my-route', (request, reply) => {
        reply.send('');
    });
    const address = await app.listen();

    const buffer = [];

    plugin.metrics.on('data', metric => {
        buffer.push(metric);
    });

    plugin.metrics.on('end', () => {
        t.equal(buffer.length, 1);
        t.equal(
            buffer[0].name,
            'http_request_duration_seconds',
            'metric name should match metric stream object',
        );
        t.equal(
            buffer[0].description,
            'App route response time',
            'metric description should match metric stream object',
        );
        t.equal(
            buffer[0].type,
            5,
            'metric type should match metric stream object',
        );
        t.same(
            buffer[0].labels,
            [
                { name: 'method', value: 'GET' },
                { name: 'url', value: '/my-route' },
                { name: 'status_code', value: '2xx' },
            ],
            'generated labels object should match metric stream object',
        );
        t.end();
    });

    const http = supertest(address);
    await http.get('/my-route');

    plugin.metrics.push(null);

    await app.close();
});

test('timeAllRoutes = true: No metrics are generated when route url config is explicitly defined', async t => {
    const app = fastify();
    const plugin = new Plugin({ timeAllRoutes: true });
    app.register(plugin.plugin());
    app.get('/my-route', { config: { timing: false } }, (request, reply) => {
        reply.send('');
    });
    const address = await app.listen();

    const buffer = [];

    plugin.metrics.on('data', metric => {
        buffer.push(metric);
    });

    plugin.metrics.on('end', () => {
        t.equal(buffer.length, 0);
        t.end();
    });

    const http = supertest(address);
    await http.get('/my-route');

    plugin.metrics.push(null);

    await app.close();
});
