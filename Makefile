all:
	@npm install -d
	@cp scripts/githooks/* .git/hooks/
	@chmod -R +x .git/hooks/

test:
	@node scripts/runtests.js

lint:
	@node scripts/runlint.js

.PHONY: all test lint