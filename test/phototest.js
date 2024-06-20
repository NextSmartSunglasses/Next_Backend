import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';
import app from '../app.js'; // Ensure this path points to your app.js
import fs from 'fs';
import path from 'path';
import Photo from '../models/photo.js';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Photo API', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should upload a photo', (done) => {
    const saveStub = sandbox.stub(Photo.prototype, 'save').resolves();

    chai.request(app)
      .post('/api/photos/upload')
      .set('Content-Type', 'multipart/form-data')
      .attach('photo', fs.readFileSync(path.join(__dirname, 'test-photo.jpg')), 'test-photo.jpg')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('message', 'Photo uploaded successfully!');
        expect(saveStub.calledOnce).to.be.true;
        done();
      });
  });

  it('should get all photos', (done) => {
    const findStub = sandbox.stub(Photo, 'find').resolves([{ name: 'test-photo.jpg', data: Buffer.from([]), contentType: 'image/jpeg' }]);

    chai.request(app)
      .get('/api/photos')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(findStub.calledOnce).to.be.true;
        done();
      });
  });
});
