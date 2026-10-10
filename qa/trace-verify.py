import urllib.request, json, re

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

op = urllib.request.build_opener(NoRedirect)
mp = json.loads(urllib.request.urlopen("http://127.0.0.1:54324/api/v1/messages?limit=1").read())
msg = json.loads(urllib.request.urlopen(f"http://127.0.0.1:54324/api/v1/message/{mp['messages'][0]['ID']}").read())
raw = (msg.get("HTML") or "").replace("&", "&")
m = re.search(r'href="([^"]+)"', raw)
url = m.group(1)
print("verify url:", url[:130])
try:
    op.open(url)
    print("verify → NO REDIRECT (200?)")
except urllib.error.HTTPError as e:
    print("verify →", (e.headers.get("Location") or "NO LOC")[:170])
