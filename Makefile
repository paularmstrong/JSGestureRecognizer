all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

lint:
	@node scripts/runlint.js

dist:
	@scripts/dist.sh

.PHONY: all lint dist