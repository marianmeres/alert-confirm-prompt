import path from 'node:path';
import { strict as assert } from 'node:assert';
import { fileURLToPath } from 'node:url';
import { createClog } from '@marianmeres/clog';
import { TestRunner } from '@marianmeres/test-runner';
import { createAlertConfirmPromptStore } from '../src/lib/stores/alert-confirm-prompt.js';
import { Type } from '../src/lib/stores/alert-confirm-prompt.js';

const clog = createClog(path.basename(fileURLToPath(import.meta.url)));
const suite = new TestRunner(path.basename(fileURLToPath(import.meta.url)));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

suite.test('flow', async () => {
	const acp = createAlertConfirmPromptStore();
	let log;

	assert(acp.get().length === 0);

	acp.alert();

	assert(acp.get().length === 1);
	assert(acp.get()[0].type === Type.ALERT);

	acp.get()[0].onOk(null);

	assert(acp.get().length === 0);

	acp.confirm(acp.close);

	acp.prompt((value) => {
		log = value;
		acp.close();
		acp.alert();
	});

	assert(acp.get().length === 2);

	acp.get()[0].onOk();
	assert(log === undefined);

	assert(acp.get().length === 1);

	acp.get()[0].onOk(123);
	assert(log === 123);

	assert(acp.get().length === 1);
	assert(acp.get()[0].type === Type.ALERT);

	// clog(acp.get());
});

export default suite;
