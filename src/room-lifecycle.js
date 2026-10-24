'use strict';
// The server has no external database: bound in-memory room creation to avoid
// indefinite stale lobbies and unbounded allocation by anonymous visitors.
const MAX_ROOMS = 128;
const MAX_AGE = Object.freeze({lobby: 12*60*60*1000, finished: 24*60*60*1000, abandoned: 48*60*60*1000});
function isExpired(room, now, connected) {
 if (!room || connected) return false;
 const last = Number(room.lastActivityAt);
 if (!Number.isSafeInteger(last) || last < 0 || last > now) return false;
 const age = now-last;
 if (room.status === 'lobby') return age >= MAX_AGE.lobby;
 if (room.status === 'finished') return age >= MAX_AGE.finished;
 return age >= MAX_AGE.abandoned;
}
function assertCapacity(rooms) {
 if (!rooms || !Number.isSafeInteger(rooms.size)) throw Error('Cannot determine hosting capacity.');
 if (rooms.size >= MAX_ROOMS) throw Error('The host has reached its game room limit. Try again later.');
}
module.exports = {MAX_ROOMS, MAX_AGE, isExpired, assertCapacity};
