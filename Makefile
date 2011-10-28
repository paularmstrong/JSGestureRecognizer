all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

lint:
	@node scripts/runlint.js

.PHONY: all lint