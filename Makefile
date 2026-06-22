.PHONY: dev build lint type-check

dev:
	npm run dev

build:
	npm run build

lint:
	npm run lint

type-check:
	npx tsc --noEmit
