#!/bin/bash
cd /home/ubuntu/dmcgrid
exec agy --dangerously-skip-permissions --print "Read docs/wave5-brief.md and execute it fully. The DB runs locally (kong 127.0.0.1:54321, psql via docker container supabase_db_db). Build the wizard page, migration 00015, RPC, and qa/e2e-wave5.py; verify tsc --noEmit and the prod build are clean; do NOT git commit."
