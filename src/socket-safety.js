'use strict';
// A stalled TV/phone must never accumulate an unbounded queue of snapshots.
// Do not build JSON for a client whose outgoing queue is already too large.
const MAX_PENDING_BYTES=512*1024;
function sendSafely(ws,payload,OPEN=1){
 if(!ws||ws.readyState!==OPEN)return false;
 if(ws.bufferedAmount>MAX_PENDING_BYTES){
  try{ws.terminate();}catch{}
  return false;
 }
 try{ws.send(JSON.stringify(payload));return true;}
 catch{return false;}
}
module.exports={MAX_PENDING_BYTES,sendSafely};
