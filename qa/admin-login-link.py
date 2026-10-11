import json, re, time, urllib.request

# Read the fresh admin magic link (created moments ago) and print it.
mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
msg = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/message/" + mp["messages"][0]["ID"]).read())
raw = (msg.get("HTML") or "").replace(chr(38) + "amp;", chr(38))
link = re.search(r'href="([^"]+)"', raw).group(1)
public = link.replace("http://127.0.0.1:54321/auth/v1/verify", "https://dmcgrid.gomedicure.com/auth/v1/verify")
print(public)
