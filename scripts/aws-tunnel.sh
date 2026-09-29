#!/usr/bin/env bash
set -euo pipefail
# Override O1BO_AWS_HOST after the EC2 public IP changes.
# Pin the previously verified server identity; a different host key must be investigated.
exec ssh -i "${O1BO_SSH_KEY:-/home/orora/aws/japan-app-key.pem}" \
  -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes \
  -o HostKeyAlias=57.182.243.64 -o ExitOnForwardFailure=yes \
  -o ServerAliveInterval=30 -o ServerAliveCountMax=3 \
  -N -L 127.0.0.1:3000:127.0.0.1:80 "ubuntu@${O1BO_AWS_HOST:-57.183.12.111}"
