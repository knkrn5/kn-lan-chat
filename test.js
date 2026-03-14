const url = "https://legacy-chat-api-prod.tagmango.com/get-all-participants-by-room?room=66cb77d4422a35f73d21c010&page=289&limit=10"

const res = await fetch(url);
const data = await res.json();

console.log(data);