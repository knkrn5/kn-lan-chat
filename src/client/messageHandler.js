//** client socket.on('data') handler for processing server messages
export class MessageHandler {
  handleServerMessage(data) {
    const dataStr = data.toString().trim();
    const dataArr = dataStr.split(" ").filter(Boolean);

    // Private message
    if (dataArr[0] === "-cname") {
      const senderName = dataArr[1].trim();
      const msg = dataArr.slice(2).join(" ");
      console.log(`📩 ${senderName}: ${msg.trim()}`);
      return;
    }

    // Broadcast message
    if (dataArr[0] === "-bc") {
      const msg = dataArr.slice(1).join(" ");
      console.log(`📢 ${msg.trim()}`);
      return;
    }

    // Client list
    if (dataArr[0] === "-cl") {
      const filteredArr = dataArr.map((str) => str.replace(/-cl$/, ""));
      const msg = filteredArr.join(" ");
      console.log(msg);
      return;
    }

    // Default: just print the message
    console.log(`🖥️  ${dataStr}`);
  }
}
