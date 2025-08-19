// backend/test/example_test.js
const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');

const { expect } = chai;

const Mood = require('../models/Mood');
const { addMood, getMoods, updateMood, deleteMood } = require('../controllers/moodController');

describe('Mood Controller Tests', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore(); // evitar "already wrapped"
  });

  /* ------------------------ AddMood ------------------------ */
  describe('AddMood Function Test', () => {
    it('should create a new mood successfully', async () => {
      const req = {
        user: { id: new mongoose.Types.ObjectId() }, // en add no hay check de owner
        body: { date: '2025-12-31', mood: 'happy', intensity: 4, notes: 'Feeling good' }
      };

      const createdMood = { _id: new mongoose.Types.ObjectId(), ...req.body, userId: req.user.id };

      const createStub = sandbox.stub(Mood, 'create').resolves(createdMood);

      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      await addMood(req, res);

      expect(createStub.calledOnceWith({ userId: req.user.id, ...req.body })).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.json.calledWith(createdMood)).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      sandbox.stub(Mood, 'create').throws(new Error('DB Error'));

      const req = {
        user: { id: new mongoose.Types.ObjectId() },
        body: { date: '2025-12-31', mood: 'sad', intensity: 2, notes: 'Bad day' }
      };

      const res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.spy()
      };

      await addMood(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  /* ------------------------ UpdateMood ------------------------ */
  describe('UpdateMood Function Test', () => {
    it('should update mood successfully', async () => {
      // 👇 En tu controller hay check de ownership: doc.userId.toString() === req.user.id
      const userIdObj = new mongoose.Types.ObjectId();
      const userIdStr = userIdObj.toString();

      const moodId = new mongoose.Types.ObjectId();
      const existingMood = {
        _id: moodId,
        userId: userIdObj,           // <- owner correcto (ObjectId)
        date: '2025-01-01',
        mood: 'neutral',
        intensity: 3,
        notes: 'ok',
        save: sandbox.stub().resolvesThis(), // se usa findById + save en tu controller
      };

      const req = {
        params: { id: moodId },
        user: { id: userIdStr },     // <- request trae string (como hace tu controller)
        body: { mood: 'happy', intensity: 5, notes: 'Great!' }
      };
      const res = { json: sandbox.spy(), status: sandbox.stub().returnsThis() };

      // Tu controller usa findById + save (no usa findByIdAndUpdate)
      const findByIdStub = sandbox.stub(Mood, 'findById').resolves(existingMood);

      await updateMood(req, res);

      // Se espera que haya guardado y respondido con el doc actualizado
      expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
      expect(existingMood.save.called).to.be.true;
      expect(res.json.calledOnce).to.be.true;

      // No debe setear status de error
      expect(res.status.called).to.be.false;
    });

    it('should return 404 if mood is not found', async () => {
      sandbox.stub(Mood, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId() }, user: { id: 'x' }, body: {} };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.spy() };

      await updateMood(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Mood not found' })).to.be.true;
    });

    it('should return 500 on error', async () => {
      sandbox.stub(Mood, 'findById').throws(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId() }, user: { id: 'x' }, body: {} };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.spy() };

      await updateMood(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.called).to.be.true;
    });
  });

  /* ------------------------ GetMoods ------------------------ */
  describe('GetMood Function Test', () => {
    it('should return moods for the given user', async () => {
      // Tu controller usa req.user.id como string en el query
      const userIdStr = new mongoose.Types.ObjectId().toString();

      const moods = [
        { _id: new mongoose.Types.ObjectId(), date: '2025-01-01', mood: 'happy', intensity: 4, userId: userIdStr },
        { _id: new mongoose.Types.ObjectId(), date: '2025-01-02', mood: 'sad', intensity: 2, userId: userIdStr }
      ];

      // Simular encadenamiento Mongoose: find(...).sort({date:-1})
      const sortStub = sandbox.stub().resolves(moods);
      const findStub = sandbox.stub(Mood, 'find').returns({ sort: sortStub });

      const req = { user: { id: userIdStr }, query: {} };
      const res = { json: sandbox.spy(), status: sandbox.stub().returnsThis() };

      await getMoods(req, res);

      expect(findStub.calledOnce).to.be.true;
      const where = findStub.firstCall.args[0] || {};
      expect(where).to.have.property('userId', userIdStr);
      expect(sortStub.calledOnceWith({ date: -1 })).to.be.true;

      // Debe devolver un array
      const payload = res.json.firstCall?.args?.[0];
      expect(Array.isArray(payload)).to.be.true;

      // No error
      expect(res.status.called).to.be.false;
    });

    it('should return 500 on error', async () => {
      // Provocamos error en sort() (find encadena sort en tu controller)
      const sortStub = () => { throw new Error('DB Error'); };
      sandbox.stub(Mood, 'find').returns({ sort: sortStub });

      const req = { user: { id: new mongoose.Types.ObjectId().toString() }, query: {} };
      const res = { json: sandbox.spy(), status: sandbox.stub().returnsThis() };

      await getMoods(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });

  /* ------------------------ DeleteMood ------------------------ */
  describe('DeleteMood Function Test', () => {
    it('should delete a mood successfully', async () => {
      // Igual que update: ownership check
      const userIdObj = new mongoose.Types.ObjectId();
      const userIdStr = userIdObj.toString();

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: userIdStr } };

      // Tu controller usa findById + deleteOne
      const mood = {
        userId: userIdObj,
        deleteOne: sandbox.stub().resolves()
      };

      const findByIdStub = sandbox.stub(Mood, 'findById').resolves(mood);

      const res = { status: sandbox.stub().returnsThis(), json: sandbox.spy() };

      await deleteMood(req, res);

      expect(findByIdStub.calledOnceWith(req.params.id)).to.be.true;
      expect(mood.deleteOne.calledOnce).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Mood deleted' })).to.be.true;

      // sin status de error
      expect(res.status.called).to.be.false;
    });

    it('should return 404 if mood is not found', async () => {
      sandbox.stub(Mood, 'findById').resolves(null);

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: 'x' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.spy() };

      await deleteMood(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'Mood not found' })).to.be.true;
    });

    it('should return 500 if an error occurs', async () => {
      sandbox.stub(Mood, 'findById').throws(new Error('DB Error'));

      const req = { params: { id: new mongoose.Types.ObjectId().toString() }, user: { id: 'x' } };
      const res = { status: sandbox.stub().returnsThis(), json: sandbox.spy() };

      await deleteMood(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.json.calledWithMatch({ message: 'DB Error' })).to.be.true;
    });
  });
});

