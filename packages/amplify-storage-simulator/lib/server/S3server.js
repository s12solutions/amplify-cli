"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const xml = require("xml");
const bodyParser = require("body-parser");
const convert = require("xml-js");
const e2p = require("event-to-promise");
const serveStatic = require("serve-static");
const glob = require("glob");
const o2x = require("object-to-xml");
const uuid = require("uuid");
const etag = require("etag");
const EventEmitter = require("events");
const util = require("./utils");
const LIST_CONTENT = 'Contents';
const LIST_COMMOM_PREFIXES = 'CommonPrefixes';
const EVENT_RECORDS = 'Records';
var corsOptions = {
    maxAge: 20000,
    exposedHeaders: ['x-amz-server-side-encryption', 'x-amz-request-id', 'x-amz-id-2', 'ETag'],
};
class StorageServer extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.uploadIds = [];
        this.localDirectoryPath = config.localDirS3;
        this.app = express();
        this.app.use(express.json());
        this.app.use(cors(corsOptions));
        this.app.use(bodyParser.raw({ limit: '100mb', type: '*/*' }));
        this.app.use(bodyParser.json({ limit: '50mb', type: '*/*' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: false, type: '*/*' }));
        this.app.use(serveStatic(this.localDirectoryPath), this.handleRequestAll.bind(this));
        this.server = null;
        this.route = config.route;
        this.upload_bufferMap = {};
    }
    start() {
        if (this.server) {
            throw new Error('Server is already running');
        }
        this.server = this.app.listen(this.config.port);
        return e2p(this.server, 'listening').then(() => {
            this.connection = this.server.address();
            this.url = `http://localhost:${this.connection.port}`;
            return this.server;
        });
    }
    stop() {
        if (this.server) {
            this.server.close();
            this.server = null;
            this.connection = null;
            this.uploadIds = null;
            this.upload_bufferMap = null;
        }
    }
    handleRequestAll(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // parsing the path and the request parameters
            util.parseUrl(request, this.route);
            // create eventObj for thr trigger
            if (request.method === 'PUT') {
                this.handleRequestPut(request, response);
            }
            if (request.method === 'POST') {
                this.handleRequestPost(request, response);
            }
            if (request.method === 'GET') {
                this.handleRequestGet(request, response);
            }
            if (request.method === 'LIST') {
                this.handleRequestList(request, response);
            }
            if (request.method === 'DELETE') {
                // emit event for delete
                let eventObj = this.createEvent(request);
                this.emit('event', eventObj);
                this.handleRequestDelete(request, response);
            }
        });
    }
    handleRequestGet(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.normalize(path_1.join(this.localDirectoryPath, request.params.path));
            if (fs_extra_1.existsSync(filePath)) {
                fs_extra_1.readFile(filePath, (err, data) => {
                    if (err) {
                        console.log('error');
                    }
                    response.send(data);
                });
            }
            else {
                response.status(404);
                response.send(o2x({
                    '?xml version="1.0" encoding="utf-8"?': null,
                    Error: {
                        Code: 'NoSuchKey',
                        Message: 'The specified key does not exist.',
                        Key: request.params.path,
                        RequestId: '',
                        HostId: '',
                    },
                }));
            }
        });
    }
    handleRequestList(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            let ListBucketResult = {};
            ListBucketResult[LIST_CONTENT] = [];
            ListBucketResult[LIST_COMMOM_PREFIXES] = [];
            let maxKeys;
            let prefix = request.query.prefix || '';
            if (request.query.maxKeys !== undefined) {
                maxKeys = Math.min(request.query.maxKeys, 1000);
            }
            else {
                maxKeys = 1000;
            }
            let delimiter = request.query.delimiter || '';
            let startAfter = request.query.startAfter || '';
            let keyCount = 0;
            // getting folders recursively
            const dirPath = path_1.normalize(path_1.join(this.localDirectoryPath, request.params.path) + '/');
            let files = glob.sync(dirPath + '/**/*');
            for (let file in files) {
                if (delimiter !== '' && util.checkfile(file, prefix, delimiter)) {
                    ListBucketResult[LIST_COMMOM_PREFIXES].push({
                        prefix: request.params.path + files[file].split(dirPath)[1],
                    });
                }
                if (!fs_extra_1.statSync(files[file]).isDirectory()) {
                    if (keyCount === maxKeys) {
                        break;
                    }
                    ListBucketResult[LIST_CONTENT].push({
                        Key: request.params.path + files[file].split(dirPath)[1],
                        LastModified: new Date(fs_extra_1.statSync(files[file]).mtime).toISOString(),
                        Size: fs_extra_1.statSync(files[file]).size,
                        ETag: etag(files[file]),
                        StorageClass: 'STANDARD',
                    });
                    keyCount = keyCount + 1;
                }
            }
            ListBucketResult['Name'] = this.route.split('/')[1];
            ListBucketResult['Prefix'] = request.query.prefix || '';
            ListBucketResult['KeyCount'] = keyCount;
            ListBucketResult['MaxKeys'] = maxKeys;
            ListBucketResult['Delimiter'] = delimiter;
            if (keyCount === maxKeys) {
                ListBucketResult['IsTruncated'] = true;
            }
            else {
                ListBucketResult['IsTruncated'] = false;
            }
            response.set('Content-Type', 'text/xml');
            response.send(o2x({
                '?xml version="1.0" encoding="utf-8"?': null,
                ListBucketResult,
            }));
        });
    }
    handleRequestDelete(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = path_1.join(this.localDirectoryPath, request.params.path);
            if (fs_extra_1.existsSync(filePath)) {
                fs_extra_1.unlink(filePath, err => {
                    if (err)
                        throw err;
                    response.send(xml(convert.json2xml(JSON.stringify(request.params.id + 'was deleted'))));
                });
            }
            else {
                response.sendStatus(204);
            }
        });
    }
    handleRequestPut(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const directoryPath = path_1.normalize(path_1.join(String(this.localDirectoryPath), String(request.params.path)));
            fs_extra_1.ensureFileSync(directoryPath);
            // strip signature in android , returns same buffer for other clients
            var new_data = util.stripChunkSignature(request.body);
            // loading data in map for each part
            if (request.query.partNumber !== undefined) {
                this.upload_bufferMap[request.query.uploadId][request.query.partNumber] = request.body;
            }
            else {
                fs_extra_1.writeFileSync(directoryPath, new_data);
                // event trigger  to differentitiate between multipart and normal put
                let eventObj = this.createEvent(request);
                this.emit('event', eventObj);
            }
            response.send(xml(convert.json2xml(JSON.stringify('upload success'))));
        });
    }
    handleRequestPost(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const directoryPath = path_1.normalize(path_1.join(String(this.localDirectoryPath), String(request.params.path)));
            if (request.query.uploads !== undefined) {
                let id = uuid();
                this.uploadIds.push(id);
                this.upload_bufferMap[id] = {};
                response.send(o2x({
                    '?xml version="1.0" encoding="utf-8"?': null,
                    InitiateMultipartUploadResult: {
                        Bucket: this.route,
                        Key: request.params.path,
                        UploadId: id
                    },
                }));
            }
            else if (this.uploadIds.includes(request.query.uploadId)) {
                let arr = Object.values(this.upload_bufferMap[request.query.uploadId]); // store all the buffers  in an array
                delete this.upload_bufferMap[request.query.uploadId]; // clear the map with current requestID
                // remove the current upload ID
                this.uploadIds.splice(this.uploadIds.indexOf(request.query.uploadId), 1);
                response.set('Content-Type', 'text/xml');
                response.send(o2x({
                    '?xml version="1.0" encoding="utf-8"?': null,
                    CompleteMultipartUploadResult: {
                        Location: request.url,
                        Bucket: this.route,
                        Key: request.params.path,
                        Etag: etag(directoryPath),
                    },
                }));
                let buf = Buffer.concat(arr);
                fs_extra_1.writeFileSync(directoryPath, buf);
                // event trigger for multipart post
                let eventObj = this.createEvent(request);
                this.emit('event', eventObj);
            }
            else {
                const directoryPath = path_1.normalize(path_1.join(String(this.localDirectoryPath), String(request.params.path)));
                fs_extra_1.ensureFileSync(directoryPath);
                var new_data = util.stripChunkSignature(request.body);
                fs_extra_1.writeFileSync(directoryPath, new_data);
                // event trigger for normal post
                let eventObj = this.createEvent(request);
                this.emit('event', eventObj);
                response.send(o2x({
                    '?xml version="1.0" encoding="utf-8"?': null,
                    PostResponse: {
                        Location: request.url,
                        Bucket: this.route,
                        Key: request.params.path,
                        Etag: etag(directoryPath),
                    },
                }));
            }
        });
    }
    // build eevent obj for s3 trigger
    createEvent(request) {
        const filePath = path_1.normalize(path_1.join(this.localDirectoryPath, request.params.path));
        let eventObj = {};
        eventObj[EVENT_RECORDS] = [];
        let event = {
            eventVersion: '2.0',
            eventSource: 'aws:s3',
            awsRegion: 'local',
            eventTime: new Date().toISOString(),
            eventName: `ObjectCreated:${request.method}`,
        };
        let s3 = {
            s3SchemaVersion: '1.0',
            configurationId: 'testConfigRule',
            bucket: {
                name: String(this.route).substring(1),
                ownerIdentity: {
                    principalId: 'A3NL1KOZZKExample',
                },
                arn: `arn:aws:s3:::${String(this.route).substring(1)}`,
            },
            object: {
                key: request.params.path,
                size: fs_extra_1.statSync(filePath).size,
                eTag: etag(filePath),
                versionId: '096fKKXTRTtl3on89fVO.nfljtsv6qko',
            },
        };
        eventObj[EVENT_RECORDS].push({
            event,
            s3,
        });
        return eventObj;
    }
}
exports.StorageServer = StorageServer;
//# sourceMappingURL=S3server.js.map