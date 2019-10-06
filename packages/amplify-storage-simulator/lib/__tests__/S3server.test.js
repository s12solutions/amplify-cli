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
const __1 = require("..");
const AWS = require("aws-sdk");
const fs = require("fs-extra");
let port = 20005; // for testing
let route = '/mock-testing';
let bucket = 'mock-testing';
let localDirS3 = __dirname + '/test-data/';
const actual_file = __dirname + '/test-data/2.png';
let s3client;
let simulator;
jest.setTimeout(2000000);
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    AWS.config.update({
        accessKeyId: 'fakeaccesskeyidfortesting',
        secretAccessKey: 'fakeaccesssecretkeyfortesting',
        region: 'eu-west-2',
    });
    let ep = new AWS.Endpoint('http://localhost:20005');
    s3client = new AWS.S3({
        apiVersion: '2006-03-01',
        endpoint: ep.href,
        s3BucketEndpoint: true,
        sslEnabled: false,
        s3ForcePathStyle: true,
    });
    simulator = new __1.AmplifyStorageSimulator({ port, route, localDirS3 });
    yield simulator.start();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    if (simulator) {
        yield simulator.stop();
    }
}));
/**
 * Test api below
 */
describe('test server running', () => {
    test('server is running', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            expect(simulator).toBeDefined();
            expect(simulator.url).toEqual('http://localhost:20005');
        }
        catch (e) {
            console.log(e);
            expect(true).toEqual(false);
        }
    }));
});
describe('Test get api', () => {
    const actual_file = __dirname + '/test-data/2.png';
    test('get image work ', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield s3client.getObject({ Bucket: bucket, Key: '2.png' }).promise();
        expect(data).toBeDefined();
        expect(data.Body).toBeDefined();
    }));
    test('get text file', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield s3client.getObject({ Bucket: bucket, Key: 'abc.txt' }).promise();
        expect(data).toBeDefined();
        expect(data.Body).toBeDefined();
        expect(data.Body.toString()).toEqual('Helloworld1234');
    }));
});
describe('Test list api', () => {
    test('get list', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield s3client.listObjects({ Bucket: bucket, Prefix: 'normal' }).promise();
        expect(response).toBeDefined();
        expect(response.Contents[0].Key).toEqual('normal/2.png');
        expect(response.Contents.length).toEqual(1);
    }));
    test('get list', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield s3client.listObjects({ Bucket: bucket }).promise();
        expect(response).toBeDefined();
        //expect(response.Contents.length).toEqual(1);
    }));
    test('empty bucket', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield s3client.listObjects({ Bucket: bucket, Prefix: 'public' }).promise();
        expect(response).toBeDefined();
        expect(response.Contents.length).toEqual(0);
    }));
    test('list object pagination', () => __awaiter(void 0, void 0, void 0, function* () {
        let maxKeys = 2;
        let total = 7;
        let response = yield s3client
            .listObjects({
            Bucket: bucket,
            Prefix: 'pagination',
            Marker: '',
            MaxKeys: maxKeys,
        })
            .promise();
        while (response.IsTruncated === true) {
            expect(response).toBeDefined();
            expect(response.Contents.length).toEqual(maxKeys);
            response = yield s3client
                .listObjects({
                Bucket: bucket,
                Prefix: 'pagination',
                Marker: response.NextMarker,
                MaxKeys: maxKeys,
            })
                .promise();
            total = total - maxKeys;
        }
        expect(response.Contents.length).toEqual(total);
    }));
});
describe('Test delete api', () => {
    const dirPathOne = __dirname + '/test-data/deleteOne';
    beforeEach(() => {
        fs.ensureDirSync(dirPathOne);
        fs.copySync(__dirname + '/test-data/normal/', dirPathOne + '/');
    });
    test('test one delete ', () => __awaiter(void 0, void 0, void 0, function* () {
        const data = yield s3client.deleteObject({ Bucket: bucket, Key: 'deleteOne/2.png' }).promise();
        expect(fs.rmdirSync(dirPathOne)).toBeUndefined;
    }));
});
describe('Test put api', () => {
    const actual_file = __dirname + '/test-data/2.png';
    const buffer = fs.readFileSync(actual_file);
    test('put image', () => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            Bucket: bucket,
            Key: '2.png',
            Prefix: 'upload',
            Body: buffer,
        };
        const data = yield s3client.upload(params).promise();
        expect(data).toBeDefined();
    }));
    const file = __dirname + '/test-data/abc.txt';
    const buf1 = fs.readFileSync(file);
    test('put text', () => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            Bucket: bucket,
            Key: 'upload/abc.txt',
            Body: buf1,
        };
        const data = yield s3client.upload(params).promise();
        expect(data).toBeDefined();
    }));
    const file1 = __dirname + '/test-data/Snake_River_(5mb).jpg';
    const buf2 = fs.readFileSync(file1);
    test(' multipart upload', () => __awaiter(void 0, void 0, void 0, function* () {
        const params = {
            Bucket: bucket,
            Key: 'upload/long_image.jpg',
            Body: buf2,
        };
        const data = yield s3client.upload(params).promise();
        expect(data.Key).toBe('upload/long_image.jpg');
    }));
    test(' async uploads', () => __awaiter(void 0, void 0, void 0, function* () {
        const params1 = {
            Bucket: bucket,
            Key: 'upload/long_image1.jpg',
            Body: buf2,
        };
        const data = yield s3client.upload(params1).promise();
        const params2 = {
            Bucket: bucket,
            Key: 'upload/long_image2.jpg',
            Body: buf2,
        };
        const data2 = yield s3client.upload(params2).promise();
        const params3 = {
            Bucket: bucket,
            Key: 'upload/long_image3.jpg',
            Body: buf2,
        };
        const data3 = yield s3client.upload(params3).promise();
        expect(data.Key).toBe('upload/long_image1.jpg');
        expect(data2.Key).toBe('upload/long_image2.jpg');
        expect(data3.Key).toBe('upload/long_image3.jpg');
    }));
    test(" async uploads", () => __awaiter(void 0, void 0, void 0, function* () {
        const params1 = {
            Bucket: bucket,
            Key: "upload/long_image1.jpg",
            Body: buf2
        };
        const params2 = {
            Bucket: bucket,
            Key: "upload/long_image2.jpg",
            Body: buf2
        };
        const params3 = {
            Bucket: bucket,
            Key: "upload/long_image3.jpg",
            Body: buf2
        };
        const uploadPromises = [];
        uploadPromises.push(s3client.upload(params1).promise());
        uploadPromises.push(s3client.upload(params2).promise());
        uploadPromises.push(s3client.upload(params3).promise());
        const uploadResults = yield Promise.all(uploadPromises);
        expect(uploadResults[0].Key).toBe('upload/long_image1.jpg');
        expect(uploadResults[1].Key).toBe("upload/long_image2.jpg");
        expect(uploadResults[2].Key).toBe("upload/long_image3.jpg");
    }));
});
//# sourceMappingURL=S3server.test.js.map