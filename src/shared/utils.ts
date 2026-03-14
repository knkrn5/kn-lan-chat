import { isIPv4, isIPv6 } from "node:net";

export function strgen(length = 5) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

export function isValidIP(s: string) {
  // const ipv4Regex = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
  // const ipv6Regex = /^(([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(::)|([0-9A-Fa-f]{1,4}:){1,7}:|:([0-9A-Fa-f]{1,4}:){1,7}|([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4}|([0-9A-Fa-f]{1,4}:){5}(:[0-9A-Fa-f]{1,4}){1,2}|([0-9A-Fa-f]{1,4}:){4}(:[0-9A-Fa-f]{1,4}){1,3}|([0-9A-Fa-f]{1,4}:){3}(:[0-9A-Fa-f]{1,4}){1,4}|([0-9A-Fa-f]{1,4}:){2}(:[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:((:[0-9A-Fa-f]{1,4}){1,6}))$/;
  // return ipv4Regex.test(s) || ipv6Regex.test(s) || s === "localhost" || s === "127.0.0.1";

  return isIPv4(s) || isIPv6(s) || s === "localhost"
}

export function repeatedPrompt(msg: string, cb: () => void) {
  process.stdout.write(msg);
  process.stdin.once("data", (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === "y") {
      cb && cb();
    } else if (answer === "n") {
      console.log("❌ Cancelled");
    } else {
      console.log("Please enter 'y' or 'n'");
      repeatedPrompt(msg, cb);
    }
  });
}
