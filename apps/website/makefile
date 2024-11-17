push-builds:
	make builds
	git add public
	git commit -m "Update builds"
	git push

builds:
	make build-canvaskit
	make build-wasm-canvaskit-dual
	# make build-wasm

build-canvaskit:
	rm -rf public/canvaskit
	mkdir -p public/canvaskit
	rm -rf build
	flutter build web --release --dart-define-from-file=defines/production.env --web-renderer canvaskit
	cp -r build/web/* public/canvaskit/

build-wasm-canvaskit-dual:
	rm -rf public/wasm-canvaskit-dual
	mkdir -p public/wasm-canvaskit-dual
	rm -rf build
	flutter build web --release --dart-define-from-file=defines/production.env --wasm
	cp -r build/web/* public/wasm-canvaskit-dual/

build-wasm:
	rm -rf public/wasm
	mkdir -p public/wasm
	rm -rf build
	flutter build web --release --dart-define-from-file=defines/production.env --web-renderer skwasm
	cp -r build/web/* public/wasm/
