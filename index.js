'use strict';

const fp = require('fastify-plugin');
const Metrics = require('@metrics/client');

class FastifyMetricsJSResponseTiming {
    constructor({ groupStatusCodes = false, timeAllRoutes = true } = {}) {
        this.groupStatusCodes = groupStatusCodes;
        this.timeAllRoutes = timeAllRoutes;

        this.metrics = new Metrics();

        this.histogram = this.metrics.histogram({
            name: 'http_request_duration_seconds',
            description: 'App route response time',
            buckets: [
                0.005,
                0.0065,
                0.00845,
                0.11,
                0.14,
                0.19,
                0.24,
                0.31,
                0.41,
                0.53,
                0.69,
                0.89,
                1.16,
                1.51,
                1.97,
                2.56,
                3.33,
                4.33,
                5.62,
                7.31,
            ],
        });
    }

    plugin() {
        return fp((fastify, opts, done) => {
            fastify.decorateRequest('timingMetrics', {});

            fastify.addHook('onRequest', (request, reply, next) => {
                if (
                    (this.timeAllRoutes === true &&
                        reply.context.config.timing !== false) ||
                    (this.timeAllRoutes === false &&
                        reply.context.config.timing === true)
                ) {
                    request.timingMetrics = {
                        histogram: this.histogram.timer(),
                    };
                }
                next();
            });

            fastify.addHook('onResponse', (request, reply, next) => {
                if (request.timingMetrics.histogram) {
                    const { method } = request.raw;
                    const statusCode = this.groupStatusCodes
                        ? `${Math.floor(reply.raw.statusCode / 100)}xx`
                        : reply.raw.statusCode;

                    request.timingMetrics.histogram({
                        labels: {
                            method: method || 'UNKNOWN',
                            url: reply.context.config.url,
                            status_code: statusCode,
                        },
                    });
                }
                next();
            });

            done();
        },{
            fastify: '^3.0.0',
            name: 'fastify-metrics-js-response-timing',
        });
    }
}

module.exports = FastifyMetricsJSResponseTiming;
