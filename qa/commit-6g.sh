cd /home/ubuntu/dmcgrid
git add -A
git -c user.name=darvis -c user.email=darvislabs@gmail.com commit -m "wave-6g: crash resilience + loading skeletons" -m "- global error.tsx: friendly crash screen with digest reference + retry (was white-screen on uncaught errors)
- dashboard loading skeletons for agent + admin dashboard routes
- latency audit: HTTP/2 + gzip + immutable static caching confirmed live; authed views 2-3.2s cold (Tokyo RTT-bound; CDN is the lever when traffic justifies it)" 2>&1 | tail -1
git push origin HEAD 2>&1 | tail -1
