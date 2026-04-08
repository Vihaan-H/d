#!/bin/bash
for i in {1..6}; do
  curl --insecure "https://api.quotable.io/quotes?page=$i&limit=150" | jq -r '.results[] | "\(.content) - \(.author)"' >> all_quotes.txt
done