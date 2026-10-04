import test from 'node:test';
import assert from 'node:assert/strict';
import {queryFromUrl, briefToUrl, writeScoutUrl} from '../frontend/src/lib/scoutUrl.ts';
const catalog = {seasons:[{id:'2526'},{id:'2425'}],teams:[{id:'arsenal',name:'Arsenal',season:'2526'},{id:'arsenal',name:'Arsenal',season:'2425'}],roles:[{id:'goalscorer',position:'ST',positions:['ST']},{id:'creator',position:'CM',positions:['CM','AM']}]};
const setLocation = url => {const u = new URL(url);globalThis.window.location = {href:u.href,pathname:u.pathname,search:u.search};};
globalThis.window = {history:{pushState:(_a,_b,url) => setLocation(url),replaceState:(_a,_b,url) => setLocation(url)}};

test('brief and deep player URLs round-trip without losing filters', () => {
  setLocation('http://localhost/scout');
  const brief = {...queryFromUrl(catalog),role:'creator',position:'AM',season:'2425',foot:'left',max_value:15000000,min_minutes:1800,max_age:27,formation:'4-2-3-1'};
  briefToUrl(brief,true);
  writeScoutUrl({page:3,player:'123',compare:'456'});
  assert.deepEqual(queryFromUrl(catalog),{...brief,page:3});
  const params = new URLSearchParams(window.location.search);
  assert.equal(params.get('player'),'123');assert.equal(params.get('compare'),'456');assert.equal(params.get('results'),'1');
  writeScoutUrl({player:null,compare:null});
  assert.equal(new URLSearchParams(window.location.search).has('player'),false);
  assert.equal(queryFromUrl(catalog).page,3);
});

test('untrusted URL fields cannot create invalid scouting requests', () => {
  setLocation('http://localhost/scout?team_id=bad&season=bad&role=bad&position=ZZ&min_minutes=-1&max_age=200&page=-2&formation=4-4-4&foot=bad');
  const q = queryFromUrl(catalog);
  assert.equal(q.team_id,'arsenal');assert.equal(q.season,'2526');assert.equal(q.role,'goalscorer');assert.equal(q.position,'ST');assert.equal(q.min_minutes,900);assert.equal(q.max_age,35);assert.equal(q.page,1);assert.equal(q.formation,null);assert.equal(q.foot,'any');
});
