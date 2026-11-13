// Zero-model website inspection continuity: compare two GitHub Actions receipts.
// Does not authorize repairs, edit production, or treat yesterday's PASS as proof today.
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const REPO='FounderNBL/FounderNBL.github.io';
const STATES=new Set(['PASS','FAIL','UNVERIFIED']);
const MAX_BYTES=200000;
export function validateGreenReport(report){
 if(!report||report.schema!==1||report.repository!==REPO||report.summary?.mode!=='live'||
    !STATES.has(report.summary.status)||report.noCustomerData!==true||
    !Array.isArray(report.findings)||report.findings.length>100||!report.findings.length||
    typeof report.at!=='string'||!Number.isFinite(Date.parse(report.at)))
   throw Error('untrusted_green_report');
 const ids=new Set(),counts={PASS:0,FAIL:0,UNVERIFIED:0};
 for(const f of report.findings){
  if(!f||typeof f.id!=='string'||!/^[A-Za-z0-9:._/-]{1,120}$/.test(f.id)||
     ids.has(f.id)||!STATES.has(f.status))throw Error('untrusted_green_findings');
  ids.add(f.id);counts[f.status]++;
 }
 for(const s of STATES)if(counts[s]!==report.summary.counts?.[s])throw Error('untrusted_green_counts');
 const verdict=counts.FAIL?'FAIL':counts.UNVERIFIED?'UNVERIFIED':'PASS';
 if(verdict!==report.summary.status||report.summary.fullWebsiteGreen!==false)
   throw Error('untrusted_green_verdict');
 return report;
}
export function compareGreenReports(current,previous=null,{previousRunId=null,lessonNames=[]}={}){
 validateGreenReport(current);
 let prior=null,priorState='NO_PREVIOUS_REPORT';
 if(previous){
  try{
   validateGreenReport(previous);
   const age=Date.parse(current.at)-Date.parse(previous.at);
   if(age<0||age>14*24*60*60*1000)throw Error('stale_green_report');
   prior=previous;priorState='VERIFIED_PREVIOUS_REPORT';
  }catch{priorState='PREVIOUS_REPORT_REJECTED';}
 }
 const old=new Map((prior?.findings||[]).map(x=>[x.id,x.status]));
 const changes={newChecks:[],regressions:[],recovered:[],persistentFailures:[],visibilityLost:[],visibilityRestored:[],confirmedFromUnverified:[],unchanged:0};
 for(const f of current.findings){
  if(!prior)break;
  const before=old.get(f.id),after=f.status;
  if(!before)changes.newChecks.push(f.id);
  else if(before===after){changes.unchanged++;if(after==='FAIL')changes.persistentFailures.push(f.id);}
  else if(before==='PASS'&&after==='FAIL')changes.regressions.push(f.id);
  else if(before==='FAIL'&&after==='PASS')changes.recovered.push(f.id);
  else if(after==='UNVERIFIED')changes.visibilityLost.push(f.id);
  else if(before==='UNVERIFIED'&&after==='PASS')changes.visibilityRestored.push(f.id);
  else if(before==='UNVERIFIED'&&after==='FAIL')changes.confirmedFromUnverified.push(f.id);
 }
 const knownLessons=lessonNames.filter(n=>/^website-green-[a-f0-9]{12}\.json$/.test(n)).length;
 return {schema:1,kind:'nbl_website_green_history',repository:REPO,at:current.at,
  currentVerdict:current.summary.status,currentCounts:current.summary.counts,
  currentRunSha:current.sha||null,previousState:priorState,
  previousRunId:prior?String(previousRunId||'unknown'):null,
  previousVerdict:prior?.summary.status||null,previousAt:prior?.at||null,
  changes,verifiedRepairLessonsInSource:knownLessons,
  verifiedRepairLessonUse:'only_on_reproduced_eligible_source_failure',
  modelCalls:0,productionWrites:0,fullWebsiteGreen:false,
  note:'Comparison of preserved public route/source receipts, NOT repair authority or full security certification.'};
}
function loadReport(file,{optional=false}={}){
 if(!file){if(optional)return null;throw Error('missing_current_report');}
 try{
  const body=readFileSync(file,'utf8');
  if(body.length>MAX_BYTES)throw Error('oversize_receipt');
  return JSON.parse(body);
 }catch(e){if(optional)return {invalid:true};throw e;}
}
export function makeHistory(currentFile,previousFile,outputFile,previousRunId='',base=process.cwd()){
 const current=loadReport(currentFile);
 const previous=loadReport(previousFile,{optional:true});
 let lessonNames=[];
 try{lessonNames=readdirSync(resolve(base,'maintenance/verified-lessons'));}catch{}
 const result=compareGreenReports(current,previous,{previousRunId,lessonNames});
 mkdirSync(dirname(outputFile),{recursive:true});
 writeFileSync(outputFile,JSON.stringify(result,null,2)+'\n');
 return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 try{
  const result=makeHistory(process.argv[2],process.argv[3],process.argv[4],process.argv[5]);
  console.log('NBL_GREEN_HISTORY',JSON.stringify({previousState:result.previousState,previousRunId:result.previousRunId,
   currentVerdict:result.currentVerdict,regressions:result.changes.regressions.length,
   recovered:result.changes.recovered.length,persistentFailures:result.changes.persistentFailures.length,
   knownVerifiedLessons:result.verifiedRepairLessonsInSource,modelCalls:0}));
 }catch(e){console.error('NBL_GREEN_HISTORY_HOLD',String(e?.message||e).slice(0,140));process.exitCode=1;}
}
