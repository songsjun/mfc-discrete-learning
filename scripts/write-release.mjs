import {writeFile} from 'node:fs/promises';
import {curriculumVersion} from '../web/course.js';

const commit=process.env.GITHUB_SHA;
const repository=process.env.GITHUB_REPOSITORY;
const workflowRunId=process.env.GITHUB_RUN_ID;
if(!/^[a-f0-9]{40}$/.test(commit || '') || !/^[\w.-]+\/[\w.-]+$/.test(repository || '') || !/^\d+$/.test(workflowRunId || '')) {
  throw new Error('Release identity must be generated in a GitHub Actions run.');
}
await writeFile(new URL('../web/release.json',import.meta.url),JSON.stringify({
  commit,repository,workflowRunId,curriculumVersion,generatedAt:new Date().toISOString()
},null,2)+'\n');
console.log('Release identity recorded for '+commit);
