#!/bin/bash

if [ ! "$1" ]; then
  echo "Network name must be given." 1>&2

  exit 0
fi

if [ ! "$2" ]; then
  echo "Contracts tags must be given." 1>&2

  exit 0
fi

npx hardhat deploy --show-stack-traces --network "$1" --tags "$2"
