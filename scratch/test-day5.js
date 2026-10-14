// test-day5.js - basic sanity checks for the project
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest')('http://localhost:5000');

describe('Project sanity tests', () => {
  it('should respond to health check', async () => {
    const res = await request.get('/api/health');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('status', 'ok');
  });
});
