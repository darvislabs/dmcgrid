import json, re, urllib.request
mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mp['messages'][0]['ID']}").read())
raw = (msg.get("HTML") or "").replace(chr(38)+"amp;", chr(38))
m = re.search(r'href="([^"]+)"', raw)
print(m.group(1))
