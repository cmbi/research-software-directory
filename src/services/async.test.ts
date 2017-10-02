import { backend, fetchEpic, reducer } from './async';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware } from 'redux-observable';

// tslint:disable-next-line:no-import-side-effect
import 'rxjs';
import * as nock from 'nock';
import Axios from 'axios';
import { BACKEND_URL} from '../settings';

describe('async backend stuff', () => {
  let store: any;
  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // travis too slow
    // tslint:disable-next-line:no-require-imports no-var-requires
    Axios.defaults.adapter = require('axios/lib/adapters/http');
    // default adapter uses OPTIONS, not compatible with nock

    const epicMiddleware = createEpicMiddleware(fetchEpic);

    store = configureMockStore([epicMiddleware])();
  });

  it('epic should go', (done) => {
    console.log(1);
    nock(BACKEND_URL)
      .get('/test')
      .reply(200, { status: 'success' } );
    console.log(2);
    store.dispatch(backend.get('test', 'test'));
    console.log(3);
    setTimeout(() => {
      console.log(4);
      expect(store.getActions()).toHaveLength(2);
      expect(store.getActions()[1].type).toBe('test/FULFILLED');
      expect(store.getActions()[1].response.status).toBe('success');
      expect(store.getActions()[1].status).toBe(200);
      done();
    }, 200);
    console.log(5);
  });

  it('reducer should work', () => {
    let state = reducer([], store.getActions()[0]);
    expect(state).toHaveLength(1);
    expect(state[0].type).toBe('test');

    state = reducer(state, store.getActions()[1]);
    expect(state).toHaveLength(1);
    expect(state[0].status).toBe('DONE');
  });

});