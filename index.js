'use strict';

let fs = require('fs'),
    path = require('path'),
    http = require('http'),
    app = require('express')(),
    swaggerTools = require('swagger-tools'),
    jsYaml = require('js-yaml');

let serverPort = process.env.PORT || 8080;
const validationErrorCode = 'SCHEMA_VALIDATION_FAILED';

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
let spec = fs.readFileSync(path.join(__dirname, 'docs/swagger.yaml'), 'utf8');
let swaggerDoc = jsYaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator({}));

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter({
        swaggerUi: path.join(__dirname, '/swagger.json'),
        controllers: path.join(__dirname, './controllers'),
    }));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    app.use((err, req, res, next) => {
        console.log(err);
        if (err.code === validationErrorCode) {
            res.status('422').json({
                errorCode: 422,
                errorMessage: err.results.errors.map(error => error.message)
            });
        } else if (err.toString().includes('Invalid content type')) {
            res.status('415').json({
                errorCode: 415,
                errorMessage: err.toString(),
            })
        } else {
            res.status('500').json({
                errorCode: 500,
                errorMessage: err.toString(),
            })
        }
    });

    // Start the server
    http.createServer(app).listen(serverPort, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
        console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    });
});
