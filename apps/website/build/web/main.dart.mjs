// Returns whether the `js-string` built-in is supported.
function detectJsStringBuiltins() {
  let bytes = [
    0,   97,  115, 109, 1,   0,   0,  0,   1,   4,   1,   96,  0,
    0,   2,   23,  1,   14,  119, 97, 115, 109, 58,  106, 115, 45,
    115, 116, 114, 105, 110, 103, 4,  99,  97,  115, 116, 0,   0
  ];
  return WebAssembly.validate(
    new Uint8Array(bytes), {builtins: ['js-string']});
}

// Compiles a dart2wasm-generated wasm modules from `source` which is then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const module = await WebAssembly.compileStreaming(
    source,
    detectJsStringBuiltins() ? {builtins: ['js-string']} : {}
  );
  return new CompiledApp(module);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const module = await WebAssembly.compile(
    bytes,
    detectJsStringBuiltins() ? {builtins: ['js-string']} : {}
  );
  return new CompiledApp(module);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module) {
    this.module = module;
  }

  async instantiate(additionalImports) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {

      _51: x0 => x0.delete(),
      _53: x0 => x0.delete(),
      _54: x0 => x0.delete(),
      _56: x0 => x0.delete(),
      _58: x0 => x0.delete(),
      _59: x0 => x0.delete(),
      _60: (x0,x1) => x0.drawPaint(x1),
      _61: x0 => x0.delete(),
      _62: (x0,x1,x2) => x0.drawPath(x1,x2),
      _63: x0 => x0.delete(),
      _64: (x0,x1) => x0.drawPicture(x1),
      _66: x0 => x0.delete(),
      _67: x0 => x0.delete(),
      _68: (x0,x1,x2,x3) => x0.drawVertices(x1,x2,x3),
      _69: x0 => x0.delete(),
      _70: x0 => x0.restore(),
      _71: x0 => x0.delete(),
      _72: x0 => x0.delete(),
      _73: x0 => x0.delete(),
      _74: x0 => ({locateFile: x0}),
      _75: (x0,x1) => ({antialias: x0,majorVersion: x1}),
      _76: () => new window.flutterCanvasKit.Paint(),
      _77: (x0,x1) => ({B: x0,C: x1}),
      _78: (x0,x1) => ({filter: x0,mipmap: x1}),
      _79: () => new window.flutterCanvasKit.Path(),
      _83: () => new window.flutterCanvasKit.PictureRecorder(),
      _84: () => ({}),
      _85: () => ({}),
      _86: () => ({}),
      _87: () => ({}),
      _89: () => ({}),
      _90: () => ({}),
      _91: x0 => new window.flutterCanvasKit.Font(x0),
      _92: (x0,x1) => ({ambient: x0,spot: x1}),
      _93: (x0,x1,x2,x3,x4) => ({width: x0,height: x1,colorType: x2,alphaType: x3,colorSpace: x4}),
      _94: (x0,x1,x2,x3,x4) => ({width: x0,height: x1,colorType: x2,alphaType: x3,colorSpace: x4}),
      _99: x0 => x0.MakeLinearToSRGBGamma(),
      _100: x0 => x0.MakeSRGBToLinearGamma(),
      _101: (x0,x1,x2) => x0.MakeCompose(x1,x2),
      _103: x0 => x0.remove(),
      _104: x0 => x0.remove(),
      _105: (x0,x1) => x0.append(x1),
      _106: x0 => x0.remove(),
      _107: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _108: x0 => x0.remove(),
      _109: (x0,x1) => x0.append(x1),
      _110: (x0,x1) => x0.append(x1),
      _111: (x0,x1) => x0.append(x1),
      _112: (x0,x1) => x0.append(x1),
      _113: (x0,x1) => x0.append(x1),
      _114: (x0,x1) => x0.append(x1),
      _116: x0 => x0.remove(),
      _117: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _118: (x0,x1) => x0.append(x1),
      _119: (x0,x1) => x0.removeChild(x1),
      _121: x0 => x0.delete(),
      _122: x0 => x0.delete(),
      _123: x0 => x0.Make(),
      _124: x0 => x0.Make(),
      _125: x0 => x0.enableFontFallback(),
      _126: (x0,x1) => x0.setDefaultFontManager(x1),
      _131: x0 => x0.delete(),
      _132: x0 => x0.delete(),
      _140: x0 => x0.makeImageAtCurrentFrame(),
      _141: (x0,x1,x2) => x0.register(x1,x2),
      _142: x0 => x0.delete(),
      _143: (x0,x1) => x0.setBlendMode(x1),
      _144: (x0,x1) => x0.setStyle(x1),
      _145: (x0,x1) => x0.setStrokeCap(x1),
      _146: (x0,x1) => x0.setStrokeJoin(x1),
      _147: (x0,x1) => x0.setColorFilter(x1),
      _148: (x0,x1) => x0.setShader(x1),
      _149: (x0,x1) => x0.setMaskFilter(x1),
      _150: (x0,x1) => x0.setImageFilter(x1),
      _151: x0 => globalThis.window.flutterCanvasKit.Free(x0),
      _152: (x0,x1) => x0.setFillType(x1),
      _155: (x0,x1) => x0.setFillType(x1),
      _156: (x0,x1) => x0.setFillType(x1),
      _158: x0 => x0.close(),
      _159: x0 => x0.reset(),
      _160: x0 => x0.copy(),
      _164: x0 => x0.makeImageSnapshot(),
      _165: x0 => x0.finishRecordingAsPicture(),
      _166: x0 => x0.delete(),
      _167: (x0,x1) => x0.append(x1),
      _168: (x0,x1) => x0.transferFromImageBitmap(x1),
      _169: x0 => x0.remove(),
      _170: x0 => x0.releaseResourcesAndAbandonContext(),
      _171: x0 => x0.delete(),
      _172: x0 => x0.stopPropagation(),
      _173: x0 => x0.preventDefault(),
      _174: x0 => x0.preventDefault(),
      _175: x0 => x0.remove(),
      _176: (x0,x1) => x0.append(x1),
      _177: (x0,x1) => x0.MakeSWCanvasSurface(x1),
      _178: (x0,x1) => x0.MakeSWCanvasSurface(x1),
      _179: x0 => x0.getCanvas(),
      _180: x0 => x0.flush(),
      _181: x0 => x0.dispose(),
      _182: (x0,x1) => x0.ParagraphStyle(x1),
      _183: (x0,x1) => x0.TextStyle(x1),
      _184: (x0,x1,x2) => x0.MakeFromFontCollection(x1,x2),
      _185: x0 => x0.build(),
      _186: x0 => x0.delete(),
      _187: x0 => x0.pop(),
      _188: (x0,x1,x2,x3) => x0.pushPaintStyle(x1,x2,x3),
      _189: x0 => x0.delete(),
      _190: x0 => x0.delete(),
      _191: (x0,x1) => x0.pushStyle(x1),
      _192: x0 => x0.select(),
      _193: (x0,x1) => x0.append(x1),
      _194: x0 => x0.remove(),
      _197: x0 => x0.unlock(),
      _202: x0 => x0.getReader(),
      _208: (x0,x1) => new URL(x0,x1),
      _209: x0 => new Blob(x0),
      _211: x0 => new MutationObserver(x0),
      _220: (x0,x1) => new OffscreenCanvas(x0,x1),
      _222: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _223: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _226: x0 => new ResizeObserver(x0),
      _228: x0 => ({createScriptURL: x0}),
      _229: (x0,x1) => new Intl.Segmenter(x0,x1),
      _230: x0 => x0.next(),
      _231: (x0,x1) => new Intl.v8BreakIterator(x0,x1),
      _233: x0 => new window.FinalizationRegistry(x0),
      _308: x0 => x0.close(),
      _309: (x0,x1,x2,x3,x4) => ({type: x0,data: x1,premultiplyAlpha: x2,colorSpaceConversion: x3,preferAnimation: x4}),
      _310: x0 => new window.ImageDecoder(x0),
      _311: x0 => x0.close(),
      _312: x0 => ({frameIndex: x0}),
      _313: (x0,x1) => x0.decode(x1),
      _316: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._316(f,arguments.length,x0) }),
      _317: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._317(f,arguments.length,x0) }),
      _318: (x0,x1) => ({addView: x0,removeView: x1}),
      _319: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._319(f,arguments.length,x0) }),
      _320: f => finalizeWrapper(f, function() { return dartInstance.exports._320(f,arguments.length) }),
      _321: (x0,x1) => ({initializeEngine: x0,autoStart: x1}),
      _322: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._322(f,arguments.length,x0) }),
      _323: x0 => ({runApp: x0}),
      _324: x0 => new Uint8Array(x0),
      _326: x0 => x0.preventDefault(),
      _327: x0 => x0.stopPropagation(),
      _328: (x0,x1) => x0.addListener(x1),
      _329: (x0,x1) => x0.removeListener(x1),
      _330: (x0,x1) => x0.prepend(x1),
      _331: x0 => x0.remove(),
      _332: x0 => x0.disconnect(),
      _333: (x0,x1) => x0.addListener(x1),
      _334: (x0,x1) => x0.removeListener(x1),
      _336: (x0,x1) => x0.append(x1),
      _337: x0 => x0.remove(),
      _338: x0 => x0.stopPropagation(),
      _342: x0 => x0.preventDefault(),
      _343: (x0,x1) => x0.append(x1),
      _344: x0 => x0.remove(),
      _345: x0 => x0.preventDefault(),
      _356: (x0,x1) => x0.append(x1),
      _357: (x0,x1) => x0.append(x1),
      _358: (x0,x1) => x0.append(x1),
      _359: x0 => x0.remove(),
      _360: x0 => x0.remove(),
      _361: x0 => x0.remove(),
      _362: (x0,x1) => x0.appendChild(x1),
      _363: (x0,x1) => x0.appendChild(x1),
      _364: x0 => x0.remove(),
      _365: (x0,x1) => x0.append(x1),
      _366: (x0,x1) => x0.append(x1),
      _367: x0 => x0.remove(),
      _368: (x0,x1) => x0.append(x1),
      _369: (x0,x1) => x0.append(x1),
      _370: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _371: (x0,x1) => x0.append(x1),
      _372: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _373: x0 => x0.remove(),
      _374: x0 => x0.remove(),
      _375: (x0,x1) => x0.append(x1),
      _376: x0 => x0.remove(),
      _377: (x0,x1) => x0.append(x1),
      _378: x0 => x0.remove(),
      _379: x0 => x0.remove(),
      _380: x0 => x0.getBoundingClientRect(),
      _381: x0 => x0.remove(),
      _394: (x0,x1) => x0.append(x1),
      _395: x0 => x0.remove(),
      _396: (x0,x1) => x0.append(x1),
      _397: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _398: x0 => x0.preventDefault(),
      _399: x0 => x0.preventDefault(),
      _400: x0 => x0.preventDefault(),
      _401: x0 => x0.preventDefault(),
      _402: x0 => x0.remove(),
      _403: (x0,x1) => x0.observe(x1),
      _404: x0 => x0.disconnect(),
      _405: (x0,x1) => x0.appendChild(x1),
      _406: (x0,x1) => x0.appendChild(x1),
      _407: (x0,x1) => x0.appendChild(x1),
      _408: (x0,x1) => x0.append(x1),
      _411: (x0,x1) => x0.append(x1),
      _412: (x0,x1) => x0.appendChild(x1),
      _413: (x0,x1) => x0.append(x1),
      _414: x0 => x0.remove(),
      _415: (x0,x1) => x0.append(x1),
      _419: (x0,x1) => x0.appendChild(x1),
      _420: x0 => x0.remove(),
      _421: x0 => globalThis.window.flutterCanvasKit = x0,
      _422: () => globalThis.window.flutterCanvasKit,
      _423: () => globalThis.window.flutterCanvasKitLoaded,
      _424: x0 => x0.BlendMode,
      _425: x0 => x0.PaintStyle,
      _426: x0 => x0.StrokeCap,
      _427: x0 => x0.StrokeJoin,
      _428: x0 => x0.BlurStyle,
      _429: x0 => x0.TileMode,
      _430: x0 => x0.FilterMode,
      _431: x0 => x0.MipmapMode,
      _432: x0 => x0.FillType,
      _433: x0 => x0.AlphaType,
      _434: x0 => x0.ColorType,
      _436: x0 => x0.ClipOp,
      _438: x0 => x0.VertexMode,
      _439: x0 => x0.RectHeightStyle,
      _440: x0 => x0.RectWidthStyle,
      _442: x0 => x0.TextAlign,
      _443: x0 => x0.TextHeightBehavior,
      _444: x0 => x0.TextDirection,
      _445: x0 => x0.FontWeight,
      _446: x0 => x0.FontSlant,
      _447: (x0,x1) => x0.MakeAnimatedImageFromEncoded(x1),
      _448: x0 => x0.Shader,
      _449: x0 => x0.MaskFilter,
      _450: x0 => x0.ColorFilter,
      _451: x0 => x0.ImageFilter,
      _453: (x0,x1) => x0.computeTonalColors(x1),
      _454: (x0,x1,x2,x3,x4,x5) => x0.MakeVertices(x1,x2,x3,x4,x5),
      _455: x0 => x0.ParagraphBuilder,
      _462: x0 => x0.NoDecoration,
      _463: x0 => x0.UnderlineDecoration,
      _464: x0 => x0.OverlineDecoration,
      _465: x0 => x0.LineThroughDecoration,
      _466: x0 => x0.DecorationStyle,
      _467: x0 => x0.TextBaseline,
      _468: x0 => x0.PlaceholderAlignment,
      _470: x0 => x0.TypefaceFontProvider,
      _471: x0 => x0.FontCollection,
      _472: x0 => x0.Typeface,
      _473: (x0,x1,x2) => x0.GetWebGLContext(x1,x2),
      _474: (x0,x1,x2) => x0.GetWebGLContext(x1,x2),
      _476: (x0,x1) => x0.MakeGrContext(x1),
      _477: (x0,x1,x2,x3,x4,x5,x6) => x0.MakeOnScreenGLSurface(x1,x2,x3,x4,x5,x6),
      _482: (x0,x1,x2,x3) => x0.MakeImage(x1,x2,x3),
      _483: (x0,x1,x2) => x0.MakeLazyImageFromTextureSource(x1,x2),
      _485: (x0,x1) => x0.default(x1),
      _486: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._486(f,arguments.length,x0,x1) }),
      _487: () => globalThis.window.flutterCanvasKit.ColorSpace.SRGB,
      _495: (x0,x1) => x0.setResourceCacheLimitBytes(x1),
      _499: x0 => x0.Upright,
      _500: x0 => x0.Italic,
      _502: x0 => x0.Thin,
      _503: x0 => x0.ExtraLight,
      _504: x0 => x0.Light,
      _505: x0 => x0.Normal,
      _506: x0 => x0.Medium,
      _507: x0 => x0.SemiBold,
      _508: x0 => x0.Bold,
      _509: x0 => x0.ExtraBold,
      _510: x0 => x0.ExtraBlack,
      _514: x0 => x0.value,
      _515: x0 => x0.RTL,
      _516: x0 => x0.LTR,
      _517: x0 => x0.value,
      _518: x0 => x0.Left,
      _519: x0 => x0.Right,
      _520: x0 => x0.Center,
      _521: x0 => x0.Justify,
      _522: x0 => x0.Start,
      _523: x0 => x0.End,
      _525: x0 => x0.All,
      _526: x0 => x0.DisableFirstAscent,
      _527: x0 => x0.DisableLastDescent,
      _528: x0 => x0.DisableAll,
      _530: x0 => x0.Tight,
      _531: x0 => x0.Max,
      _532: x0 => x0.IncludeLineSpacingMiddle,
      _533: x0 => x0.IncludeLineSpacingTop,
      _534: x0 => x0.IncludeLineSpacingBottom,
      _535: x0 => x0.Strut,
      _537: x0 => x0.Tight,
      _538: x0 => x0.Max,
      _540: x0 => x0.Triangles,
      _541: x0 => x0.TrianglesStrip,
      _542: x0 => x0.TriangleFan,
      _548: x0 => x0.Difference,
      _549: x0 => x0.Intersect,
      _551: x0 => x0.Winding,
      _552: x0 => x0.EvenOdd,
      _560: x0 => x0.Normal,
      _561: x0 => x0.Solid,
      _562: x0 => x0.Outer,
      _563: x0 => x0.Inner,
      _565: x0 => x0.Butt,
      _566: x0 => x0.Round,
      _567: x0 => x0.Square,
      _569: x0 => x0.Stroke,
      _570: x0 => x0.Fill,
      _572: x0 => x0.Clear,
      _573: x0 => x0.Src,
      _574: x0 => x0.Dst,
      _575: x0 => x0.SrcOver,
      _576: x0 => x0.DstOver,
      _577: x0 => x0.SrcIn,
      _578: x0 => x0.DstIn,
      _579: x0 => x0.SrcOut,
      _580: x0 => x0.DstOut,
      _581: x0 => x0.SrcATop,
      _582: x0 => x0.DstATop,
      _583: x0 => x0.Xor,
      _584: x0 => x0.Plus,
      _585: x0 => x0.Modulate,
      _586: x0 => x0.Screen,
      _587: x0 => x0.Overlay,
      _588: x0 => x0.Darken,
      _589: x0 => x0.Lighten,
      _590: x0 => x0.ColorDodge,
      _591: x0 => x0.ColorBurn,
      _592: x0 => x0.HardLight,
      _593: x0 => x0.SoftLight,
      _594: x0 => x0.Difference,
      _595: x0 => x0.Exclusion,
      _596: x0 => x0.Multiply,
      _597: x0 => x0.Hue,
      _598: x0 => x0.Saturation,
      _599: x0 => x0.Color,
      _600: x0 => x0.Luminosity,
      _602: x0 => x0.Miter,
      _603: x0 => x0.Round,
      _604: x0 => x0.Bevel,
      _606: x0 => x0.Clamp,
      _607: x0 => x0.Repeat,
      _608: x0 => x0.Mirror,
      _609: x0 => x0.Decal,
      _611: x0 => x0.Nearest,
      _612: x0 => x0.Linear,
      _614: x0 => x0.None,
      _616: x0 => x0.Linear,
      _619: x0 => x0.Premul,
      _625: x0 => x0.RGBA_8888,
      _634: x0 => x0.getFrameCount(),
      _635: x0 => x0.getRepetitionCount(),
      _636: x0 => x0.currentFrameDuration(),
      _637: x0 => x0.decodeNextFrame(),
      _646: x0 => x0.width(),
      _648: x0 => x0.height(),
      _649: (x0,x1,x2,x3,x4,x5) => x0.makeShaderCubic(x1,x2,x3,x4,x5),
      _650: (x0,x1,x2,x3,x4,x5) => x0.makeShaderOptions(x1,x2,x3,x4,x5),
      _652: (x0,x1,x2,x3) => x0.readPixels(x1,x2,x3),
      _654: (x0,x1) => x0.isAliasOf(x1),
      _656: (x0,x1,x2,x3,x4,x5,x6) => x0.MakeLinearGradient(x1,x2,x3,x4,x5,x6),
      _657: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.MakeRadialGradient(x1,x2,x3,x4,x5,x6,x7),
      _658: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.MakeTwoPointConicalGradient(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      _661: (x0,x1,x2,x3) => x0.MakeBlur(x1,x2,x3),
      _664: (x0,x1) => x0.setStrokeWidth(x1),
      _668: (x0,x1) => x0.setAntiAlias(x1),
      _669: (x0,x1) => x0.setColorInt(x1),
      _673: (x0,x1) => x0.setStrokeMiter(x1),
      _677: (x0,x1,x2) => x0.MakeBlend(x1,x2),
      _678: (x0,x1) => x0.MakeMatrix(x1),
      _685: (x0,x1,x2,x3,x4) => x0.MakeBlur(x1,x2,x3,x4),
      _686: (x0,x1,x2,x3) => x0.MakeMatrixTransform(x1,x2,x3),
      _696: (x0,x1) => x0.getOutputBounds(x1),
      _699: () => globalThis.Float32Array,
      _701: (x0,x1) => globalThis.window.flutterCanvasKit.Malloc(x0,x1),
      _706: x0 => x0.toTypedArray(),
      _712: (x0,x1,x2,x3) => x0.addOval(x1,x2,x3),
      _713: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11) => x0.addPath(x1,x2,x3,x4,x5,x6,x7,x8,x9,x10,x11),
      _716: (x0,x1,x2) => x0.addRRect(x1,x2),
      _717: (x0,x1) => x0.addRect(x1),
      _718: (x0,x1,x2,x3,x4) => x0.arcToOval(x1,x2,x3,x4),
      _719: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.arcToRotated(x1,x2,x3,x4,x5,x6,x7),
      _722: (x0,x1,x2) => x0.contains(x1,x2),
      _724: (x0,x1,x2,x3,x4,x5,x6) => x0.cubicTo(x1,x2,x3,x4,x5,x6),
      _725: x0 => x0.getBounds(),
      _726: (x0,x1,x2) => x0.lineTo(x1,x2),
      _728: (x0,x1,x2) => x0.moveTo(x1,x2),
      _738: x0 => x0.toSVGString(),
      _741: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.transform(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      _752: (x0,x1,x2) => x0.beginRecording(x1,x2),
      _755: (x0,x1) => x0.clear(x1),
      _756: (x0,x1,x2,x3) => x0.clipPath(x1,x2,x3),
      _758: (x0,x1,x2,x3) => x0.clipRRect(x1,x2,x3),
      _759: (x0,x1,x2,x3) => x0.clipRect(x1,x2,x3),
      _762: (x0,x1,x2,x3,x4,x5) => x0.drawArc(x1,x2,x3,x4,x5),
      _764: (x0,x1,x2,x3,x4) => x0.drawCircle(x1,x2,x3,x4),
      _766: (x0,x1,x2,x3) => x0.drawDRRect(x1,x2,x3),
      _770: (x0,x1,x2,x3,x4,x5,x6) => x0.drawImageRectCubic(x1,x2,x3,x4,x5,x6),
      _771: (x0,x1,x2,x3,x4,x5,x6) => x0.drawImageRectOptions(x1,x2,x3,x4,x5,x6),
      _773: (x0,x1,x2,x3,x4,x5) => x0.drawLine(x1,x2,x3,x4,x5),
      _774: (x0,x1,x2) => x0.drawOval(x1,x2),
      _778: (x0,x1,x2) => x0.drawRRect(x1,x2),
      _780: (x0,x1,x2) => x0.drawRect(x1,x2),
      _781: (x0,x1,x2,x3,x4,x5,x6,x7) => x0.drawShadow(x1,x2,x3,x4,x5,x6,x7),
      _783: x0 => x0.save(),
      _784: x0 => x0.getSaveCount(),
      _785: (x0,x1,x2,x3,x4) => x0.saveLayer(x1,x2,x3,x4),
      _787: (x0,x1) => x0.restoreToCount(x1),
      _788: (x0,x1,x2,x3) => x0.rotate(x1,x2,x3),
      _789: (x0,x1,x2) => x0.scale(x1,x2),
      _792: (x0,x1) => x0.concat(x1),
      _793: (x0,x1,x2) => x0.translate(x1,x2),
      _797: (x0,x1,x2,x3) => x0.drawParagraph(x1,x2,x3),
      _799: x0 => x0.cullRect(),
      _802: (x0,x1) => x0.addText(x1),
      _807: (x0,x1,x2,x3,x4,x5) => x0.addPlaceholder(x1,x2,x3,x4,x5),
      _809: x0 => x0.getText(),
      _811: (x0,x1) => x0.setWordsUtf16(x1),
      _813: (x0,x1) => x0.setGraphemeBreaksUtf16(x1),
      _816: (x0,x1) => x0.setLineBreaksUtf16(x1),
      _819: (x0,x1) => x0.textAlign = x1,
      _820: (x0,x1) => x0.textDirection = x1,
      _821: (x0,x1) => x0.heightMultiplier = x1,
      _822: (x0,x1) => x0.textHeightBehavior = x1,
      _823: (x0,x1) => x0.maxLines = x1,
      _824: (x0,x1) => x0.ellipsis = x1,
      _825: (x0,x1) => x0.textStyle = x1,
      _826: (x0,x1) => x0.strutStyle = x1,
      _827: (x0,x1) => x0.replaceTabCharacters = x1,
      _828: (x0,x1) => x0.applyRoundingHack = x1,
      _829: x0 => x0.Solid,
      _830: x0 => x0.Double,
      _831: x0 => x0.Dotted,
      _832: x0 => x0.Dashed,
      _833: x0 => x0.Wavy,
      _835: x0 => x0.Alphabetic,
      _836: x0 => x0.Ideographic,
      _838: x0 => x0.Baseline,
      _839: x0 => x0.AboveBaseline,
      _840: x0 => x0.BelowBaseline,
      _841: x0 => x0.Top,
      _842: x0 => x0.Bottom,
      _843: x0 => x0.Middle,
      _845: (x0,x1) => x0.backgroundColor = x1,
      _846: (x0,x1) => x0.color = x1,
      _847: (x0,x1) => x0.foregroundColor = x1,
      _848: (x0,x1) => x0.decoration = x1,
      _849: (x0,x1) => x0.decorationThickness = x1,
      _850: (x0,x1) => x0.decorationColor = x1,
      _851: (x0,x1) => x0.decorationStyle = x1,
      _852: (x0,x1) => x0.textBaseline = x1,
      _853: (x0,x1) => x0.fontSize = x1,
      _854: (x0,x1) => x0.letterSpacing = x1,
      _855: (x0,x1) => x0.wordSpacing = x1,
      _856: (x0,x1) => x0.heightMultiplier = x1,
      _857: (x0,x1) => x0.halfLeading = x1,
      _858: (x0,x1) => x0.locale = x1,
      _859: (x0,x1) => x0.fontFamilies = x1,
      _860: (x0,x1) => x0.fontStyle = x1,
      _862: (x0,x1) => x0.fontFeatures = x1,
      _863: (x0,x1) => x0.fontVariations = x1,
      _864: (x0,x1) => x0.fontFamilies = x1,
      _865: (x0,x1) => x0.fontStyle = x1,
      _866: (x0,x1) => x0.fontSize = x1,
      _867: (x0,x1) => x0.heightMultiplier = x1,
      _868: (x0,x1) => x0.halfLeading = x1,
      _869: (x0,x1) => x0.leading = x1,
      _870: (x0,x1) => x0.strutEnabled = x1,
      _872: (x0,x1) => x0.weight = x1,
      _873: (x0,x1) => x0.slant = x1,
      _877: (x0,x1) => x0.name = x1,
      _878: (x0,x1) => x0.value = x1,
      _879: (x0,x1) => x0.axis = x1,
      _880: (x0,x1) => x0.value = x1,
      _881: (x0,x1) => x0.getGlyphIDs(x1),
      _882: (x0,x1,x2,x3) => x0.getGlyphBounds(x1,x2,x3),
      _886: (x0,x1,x2) => x0.registerFont(x1,x2),
      _890: x0 => x0.startIndex,
      _891: x0 => x0.endIndex,
      _894: x0 => x0.isHardBreak,
      _895: x0 => x0.ascent,
      _896: x0 => x0.descent,
      _898: x0 => x0.width,
      _899: x0 => x0.left,
      _900: x0 => x0.baseline,
      _901: x0 => x0.lineNumber,
      _902: x0 => x0.graphemeLayoutBounds,
      _903: x0 => x0.dir,
      _904: x0 => x0.graphemeClusterTextRange,
      _905: x0 => x0.rect,
      _907: x0 => x0.dir,
      _910: x0 => x0.getAlphabeticBaseline(),
      _911: x0 => x0.didExceedMaxLines(),
      _912: x0 => x0.getHeight(),
      _914: x0 => x0.getIdeographicBaseline(),
      _915: x0 => x0.getLineMetrics(),
      _916: (x0,x1) => x0.getLineMetricsAt(x1),
      _917: x0 => x0.getNumberOfLines(),
      _919: x0 => x0.getLongestLine(),
      _920: x0 => x0.getMaxIntrinsicWidth(),
      _921: x0 => x0.getMinIntrinsicWidth(),
      _922: x0 => x0.getMaxWidth(),
      _924: (x0,x1,x2,x3,x4) => x0.getRectsForRange(x1,x2,x3,x4),
      _925: x0 => x0.getRectsForPlaceholders(),
      _926: (x0,x1,x2) => x0.getGlyphPositionAtCoordinate(x1,x2),
      _928: (x0,x1) => x0.getGlyphInfoAt(x1),
      _929: (x0,x1,x2) => x0.getClosestGlyphInfoAtCoordinate(x1,x2),
      _930: (x0,x1) => x0.getWordBoundary(x1),
      _932: (x0,x1) => x0.layout(x1),
      _934: x0 => x0.affinity,
      _935: x0 => x0.pos,
      _936: x0 => x0.start,
      _937: x0 => x0.end,
      _940: x0 => x0.ambient,
      _941: x0 => x0.spot,
      _947: (x0,x1) => x0.MakeFreeTypeFaceFromData(x1),
      _949: x0 => x0.isDeleted(),
      _974: x0 => globalThis.window.flutterCanvasKit.RuntimeEffect.Make(x0),
      _975: (x0,x1) => x0.makeShader(x1),
      _976: (x0,x1,x2) => x0.makeShaderWithChildren(x1,x2),
      _977: x0 => x0.toString(),
      _978: (x0,x1,x2) => x0.set(x1,x2),
      _979: () => globalThis.window.flutterConfiguration,
      _980: x0 => x0.assetBase,
      _981: x0 => x0.canvasKitBaseUrl,
      _982: x0 => x0.canvasKitVariant,
      _983: x0 => x0.canvasKitForceCpuOnly,
      _984: x0 => x0.canvasKitMaximumSurfaces,
      _985: x0 => x0.debugShowSemanticsNodes,
      _986: x0 => x0.hostElement,
      _987: x0 => x0.multiViewEnabled,
      _988: x0 => x0.nonce,
      _990: x0 => x0.fontFallbackBaseUrl,
      _991: x0 => x0.useColorEmoji,
      _995: x0 => x0.console,
      _996: x0 => x0.devicePixelRatio,
      _997: x0 => x0.document,
      _998: x0 => x0.history,
      _999: x0 => x0.innerHeight,
      _1000: x0 => x0.innerWidth,
      _1001: x0 => x0.location,
      _1002: x0 => x0.navigator,
      _1003: x0 => x0.visualViewport,
      _1004: x0 => x0.performance,
      _1006: x0 => x0.URL,
      _1007: (x0,x1) => x0.dispatchEvent(x1),
      _1008: (x0,x1) => x0.matchMedia(x1),
      _1010: (x0,x1) => x0.getComputedStyle(x1),
      _1011: x0 => x0.screen,
      _1013: (x0,x1) => x0.requestAnimationFrame(x1),
      _1014: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1014(f,arguments.length,x0) }),
      _1017: x0 => x0.trustedTypes,
      _1018: (x0,x1) => x0.warn(x1),
      _1019: (x0,x1) => x0.error(x1),
      _1020: (x0,x1) => x0.debug(x1),
      _1021: () => globalThis.window,
      _1022: () => globalThis.Intl,
      _1023: () => globalThis.Symbol,
      _1024: (x0,x1,x2,x3,x4) => globalThis.createImageBitmap(x0,x1,x2,x3,x4),
      _1026: x0 => x0.clipboard,
      _1027: x0 => x0.maxTouchPoints,
      _1028: x0 => x0.vendor,
      _1029: x0 => x0.language,
      _1030: x0 => x0.platform,
      _1031: x0 => x0.userAgent,
      _1032: x0 => x0.languages,
      _1033: x0 => x0.documentElement,
      _1034: (x0,x1) => x0.querySelector(x1),
      _1038: (x0,x1) => x0.createElement(x1),
      _1039: (x0,x1) => x0.execCommand(x1),
      _1041: (x0,x1,x2) => x0.createElementNS(x1,x2),
      _1042: (x0,x1) => x0.createTextNode(x1),
      _1043: (x0,x1) => x0.createEvent(x1),
      _1047: x0 => x0.head,
      _1048: x0 => x0.body,
      _1049: (x0,x1) => x0.title = x1,
      _1052: x0 => x0.activeElement,
      _1054: x0 => x0.visibilityState,
      _1055: () => globalThis.document,
      _1056: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1057: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1058: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1060: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1060(f,arguments.length,x0) }),
      _1061: x0 => x0.target,
      _1063: x0 => x0.timeStamp,
      _1064: x0 => x0.type,
      _1066: x0 => x0.preventDefault(),
      _1069: (x0,x1,x2,x3) => x0.initEvent(x1,x2,x3),
      _1075: x0 => x0.baseURI,
      _1076: x0 => x0.firstChild,
      _1079: x0 => x0.lastChild,
      _1081: x0 => x0.parentElement,
      _1083: x0 => x0.parentNode,
      _1084: x0 => x0.nextSibling,
      _1086: (x0,x1) => x0.removeChild(x1),
      _1087: (x0,x1) => x0.removeChild(x1),
      _1088: x0 => x0.isConnected,
      _1089: (x0,x1) => x0.textContent = x1,
      _1090: (x0,x1) => x0.cloneNode(x1),
      _1091: (x0,x1) => x0.contains(x1),
      _1095: x0 => x0.children,
      _1099: x0 => x0.clientHeight,
      _1100: x0 => x0.clientWidth,
      _1101: x0 => x0.offsetHeight,
      _1102: x0 => x0.offsetWidth,
      _1103: x0 => x0.id,
      _1104: (x0,x1) => x0.id = x1,
      _1107: (x0,x1) => x0.spellcheck = x1,
      _1108: x0 => x0.tagName,
      _1109: x0 => x0.style,
      _1110: (x0,x1) => x0.append(x1),
      _1111: (x0,x1) => x0.getAttribute(x1),
      _1113: x0 => x0.getBoundingClientRect(),
      _1115: (x0,x1) => x0.querySelector(x1),
      _1116: (x0,x1) => x0.closest(x1),
      _1118: (x0,x1) => x0.querySelectorAll(x1),
      _1120: x0 => x0.remove(),
      _1122: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1124: (x0,x1) => x0.removeAttribute(x1),
      _1125: (x0,x1) => x0.tabIndex = x1,
      _1128: (x0,x1) => x0.focus(x1),
      _1129: x0 => x0.scrollTop,
      _1130: (x0,x1) => x0.scrollTop = x1,
      _1131: x0 => x0.scrollLeft,
      _1132: (x0,x1) => x0.scrollLeft = x1,
      _1133: x0 => x0.classList,
      _1134: (x0,x1) => x0.className = x1,
      _1139: (x0,x1) => x0.getElementsByClassName(x1),
      _1141: x0 => x0.click(),
      _1143: (x0,x1) => x0.hasAttribute(x1),
      _1146: (x0,x1) => x0.attachShadow(x1),
      _1150: (x0,x1) => x0.getPropertyValue(x1),
      _1152: (x0,x1,x2,x3) => x0.setProperty(x1,x2,x3),
      _1154: (x0,x1) => x0.removeProperty(x1),
      _1156: x0 => x0.offsetLeft,
      _1157: x0 => x0.offsetTop,
      _1158: x0 => x0.offsetParent,
      _1160: (x0,x1) => x0.name = x1,
      _1161: x0 => x0.content,
      _1162: (x0,x1) => x0.content = x1,
      _1166: (x0,x1) => x0.src = x1,
      _1167: x0 => x0.naturalWidth,
      _1168: x0 => x0.naturalHeight,
      _1172: x0 => x0.decode(),
      _1176: (x0,x1) => x0.nonce = x1,
      _1181: x0 => x0.now(),
      _1183: (x0,x1) => x0.width = x1,
      _1185: (x0,x1) => x0.height = x1,
      _1190: (x0,x1) => x0.getContext(x1),
      _1191: (x0,x1) => x0.getParameter(x1),
      _1192: x0 => x0.SAMPLES,
      _1193: x0 => x0.STENCIL_BITS,
      _1210: (x0,x1,x2,x3,x4,x5,x6,x7,x8,x9) => x0.drawImage(x1,x2,x3,x4,x5,x6,x7,x8,x9),
      _1261: x0 => x0.width,
      _1262: x0 => x0.height,
      _1265: (x0,x1) => x0.fetch(x1),
      _1266: x0 => x0.status,
      _1267: x0 => x0.headers,
      _1268: x0 => x0.body,
      _1269: x0 => x0.arrayBuffer(),
      _1273: (x0,x1) => x0.get(x1),
      _1275: x0 => x0.read(),
      _1276: x0 => x0.value,
      _1277: x0 => x0.done,
      _1279: x0 => x0.name,
      _1280: x0 => x0.x,
      _1281: x0 => x0.y,
      _1284: x0 => x0.top,
      _1285: x0 => x0.right,
      _1286: x0 => x0.bottom,
      _1287: x0 => x0.left,
      _1297: x0 => x0.height,
      _1298: x0 => x0.width,
      _1299: (x0,x1) => x0.value = x1,
      _1301: (x0,x1) => x0.placeholder = x1,
      _1302: (x0,x1) => x0.name = x1,
      _1303: x0 => x0.selectionDirection,
      _1304: x0 => x0.selectionStart,
      _1305: x0 => x0.selectionEnd,
      _1308: x0 => x0.value,
      _1310: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1313: x0 => x0.readText(),
      _1314: (x0,x1) => x0.writeText(x1),
      _1315: x0 => x0.altKey,
      _1316: x0 => x0.code,
      _1317: x0 => x0.ctrlKey,
      _1318: x0 => x0.key,
      _1319: x0 => x0.keyCode,
      _1320: x0 => x0.location,
      _1321: x0 => x0.metaKey,
      _1322: x0 => x0.repeat,
      _1323: x0 => x0.shiftKey,
      _1324: x0 => x0.isComposing,
      _1326: (x0,x1) => x0.getModifierState(x1),
      _1328: x0 => x0.state,
      _1329: (x0,x1) => x0.go(x1),
      _1331: (x0,x1,x2,x3) => x0.pushState(x1,x2,x3),
      _1332: (x0,x1,x2,x3) => x0.replaceState(x1,x2,x3),
      _1333: x0 => x0.pathname,
      _1334: x0 => x0.search,
      _1335: x0 => x0.hash,
      _1339: x0 => x0.state,
      _1340: x0 => new URL(x0),
      _1341: (x0,x1) => x0.createObjectURL(x1),
      _1342: (x0,x1) => x0.revokeObjectURL(x1),
      _1345: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1345(f,arguments.length,x0,x1) }),
      _1347: (x0,x1,x2) => x0.observe(x1,x2),
      _1350: x0 => x0.attributeName,
      _1351: x0 => x0.type,
      _1352: x0 => x0.matches,
      _1355: x0 => x0.matches,
      _1357: x0 => x0.relatedTarget,
      _1358: x0 => x0.clientX,
      _1359: x0 => x0.clientY,
      _1360: x0 => x0.offsetX,
      _1361: x0 => x0.offsetY,
      _1364: x0 => x0.button,
      _1365: x0 => x0.buttons,
      _1366: x0 => x0.ctrlKey,
      _1367: (x0,x1) => x0.getModifierState(x1),
      _1370: x0 => x0.pointerId,
      _1371: x0 => x0.pointerType,
      _1372: x0 => x0.pressure,
      _1373: x0 => x0.tiltX,
      _1374: x0 => x0.tiltY,
      _1375: x0 => x0.getCoalescedEvents(),
      _1377: x0 => x0.deltaX,
      _1378: x0 => x0.deltaY,
      _1379: x0 => x0.wheelDeltaX,
      _1380: x0 => x0.wheelDeltaY,
      _1381: x0 => x0.deltaMode,
      _1387: x0 => x0.changedTouches,
      _1389: x0 => x0.clientX,
      _1390: x0 => x0.clientY,
      _1392: x0 => x0.data,
      _1395: (x0,x1) => x0.disabled = x1,
      _1396: (x0,x1) => x0.type = x1,
      _1397: (x0,x1) => x0.max = x1,
      _1398: (x0,x1) => x0.min = x1,
      _1399: (x0,x1) => x0.value = x1,
      _1400: x0 => x0.value,
      _1401: x0 => x0.disabled,
      _1402: (x0,x1) => x0.disabled = x1,
      _1403: (x0,x1) => x0.placeholder = x1,
      _1404: (x0,x1) => x0.name = x1,
      _1405: (x0,x1) => x0.autocomplete = x1,
      _1406: x0 => x0.selectionDirection,
      _1407: x0 => x0.selectionStart,
      _1408: x0 => x0.selectionEnd,
      _1412: (x0,x1,x2) => x0.setSelectionRange(x1,x2),
      _1418: (x0,x1) => x0.add(x1),
      _1421: (x0,x1) => x0.noValidate = x1,
      _1422: (x0,x1) => x0.method = x1,
      _1423: (x0,x1) => x0.action = x1,
      _1426: (x0,x1) => x0.height = x1,
      _1427: (x0,x1) => x0.width = x1,
      _1429: (x0,x1) => x0.getContext(x1),
      _1448: x0 => x0.orientation,
      _1449: x0 => x0.width,
      _1450: x0 => x0.height,
      _1451: (x0,x1) => x0.lock(x1),
      _1467: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1467(f,arguments.length,x0,x1) }),
      _1474: (x0,x1,x2) => x0.createPolicy(x1,x2),
      _1476: (x0,x1) => x0.createScriptURL(x1),
      _1478: x0 => x0.length,
      _1480: (x0,x1) => x0.item(x1),
      _1481: x0 => x0.length,
      _1482: (x0,x1) => x0.item(x1),
      _1483: x0 => x0.iterator,
      _1484: x0 => x0.Segmenter,
      _1485: x0 => x0.v8BreakIterator,
      _1486: (x0,x1) => x0.segment(x1),
      _1488: x0 => x0.done,
      _1489: x0 => x0.value,
      _1490: x0 => x0.index,
      _1494: (x0,x1) => x0.adoptText(x1),
      _1495: x0 => x0.first(),
      _1496: x0 => x0.next(),
      _1497: x0 => x0.current(),
      _1503: () => globalThis.window.FinalizationRegistry,
      _1504: () => globalThis.window.OffscreenCanvas,
      _1505: () => globalThis.window.createImageBitmap,
      _1508: x0 => x0.hostElement,
      _1509: x0 => x0.viewConstraints,
      _1511: x0 => x0.maxHeight,
      _1512: x0 => x0.maxWidth,
      _1513: x0 => x0.minHeight,
      _1514: x0 => x0.minWidth,
      _1515: x0 => x0.loader,
      _1516: () => globalThis._flutter,
      _1517: (x0,x1) => x0.didCreateEngineInitializer(x1),
      _1518: (x0,x1,x2) => x0.call(x1,x2),
      _1519: () => globalThis.Promise,
      _1520: f => finalizeWrapper(f, function(x0,x1) { return dartInstance.exports._1520(f,arguments.length,x0,x1) }),
      _1524: x0 => x0.length,
      _1526: () => globalThis.window.ImageDecoder,
      _1527: x0 => x0.tracks,
      _1531: x0 => x0.image,
      _1538: x0 => x0.displayWidth,
      _1539: x0 => x0.displayHeight,
      _1540: x0 => x0.duration,
      _1544: x0 => x0.ready,
      _1545: x0 => x0.selectedTrack,
      _1546: x0 => x0.repetitionCount,
      _1547: x0 => x0.frameCount,
      _1589: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1589(f,arguments.length,x0) }),
      _1590: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1590(f,arguments.length,x0) }),
      _1591: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1592: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1593: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1593(f,arguments.length,x0) }),
      _1594: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1595: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1595(f,arguments.length,x0) }),
      _1596: x0 => x0.send(),
      _1597: () => new XMLHttpRequest(),
      _1599: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _1600: (x0,x1,x2) => x0.addEventListener(x1,x2),
      _1601: (x0,x1) => x0.createElement(x1),
      _1602: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1603: x0 => x0.preventDefault(),
      _1604: x0 => x0.preventDefault(),
      _1605: (x0,x1) => x0.removeAttribute(x1),
      _1606: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1607: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _1608: (x0,x1,x2) => x0.removeEventListener(x1,x2),
      _1609: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _1610: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1610(f,arguments.length,x0) }),
      _1611: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1611(f,arguments.length,x0) }),
      _1612: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1613: x0 => x0.createRange(),
      _1614: (x0,x1) => x0.selectNode(x1),
      _1615: x0 => x0.getSelection(),
      _1616: x0 => x0.removeAllRanges(),
      _1617: (x0,x1) => x0.addRange(x1),
      _1618: (x0,x1) => x0.createElement(x1),
      _1619: (x0,x1) => x0.add(x1),
      _1620: (x0,x1) => x0.append(x1),
      _1621: (x0,x1,x2) => x0.insertRule(x1,x2),
      _1622: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1622(f,arguments.length,x0) }),
      _1623: (x0,x1) => x0.getItem(x1),
      _1624: (x0,x1) => x0.removeItem(x1),
      _1625: (x0,x1,x2) => x0.setItem(x1,x2),
      _1639: x0 => new Array(x0),
      _1640: x0 => x0.length,
      _1642: (x0,x1) => x0[x1],
      _1643: (x0,x1,x2) => x0[x1] = x2,
      _1646: (x0,x1,x2) => new DataView(x0,x1,x2),
      _1649: x0 => new Int8Array(x0),
      _1650: (x0,x1,x2) => new Uint8Array(x0,x1,x2),
      _1651: x0 => new Uint8Array(x0),
      _1657: x0 => new Uint16Array(x0),
      _1659: x0 => new Int32Array(x0),
      _1661: x0 => new Uint32Array(x0),
      _1663: x0 => new Float32Array(x0),
      _1665: x0 => new Float64Array(x0),
      _1671: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1671(f,arguments.length,x0) }),
      _1672: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1672(f,arguments.length,x0) }),
      _1696: (m) => import(m),
      _1698: (decoder, codeUnits) => decoder.decode(codeUnits),
      _1699: () => new TextDecoder("utf-8", {fatal: true}),
      _1700: () => new TextDecoder("utf-8", {fatal: false}),
      _1701: x0 => new WeakRef(x0),
      _1702: x0 => x0.deref(),
      _1708: Date.now,
      _1710: s => new Date(s * 1000).getTimezoneOffset() * 60,
      _1711: s => {
        if (!/^\s*[+-]?(?:Infinity|NaN|(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][+-]?\d+)?)\s*$/.test(s)) {
          return NaN;
        }
        return parseFloat(s);
      },
      _1712: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _1713: () => typeof dartUseDateNowForTicks !== "undefined",
      _1714: () => 1000 * performance.now(),
      _1715: () => Date.now(),
      _1716: () => {
        // On browsers return `globalThis.location.href`
        if (globalThis.location != null) {
          return globalThis.location.href;
        }
        return null;
      },
      _1717: () => {
        return typeof process != "undefined" &&
               Object.prototype.toString.call(process) == "[object process]" &&
               process.platform == "win32"
      },
      _1718: () => new WeakMap(),
      _1719: (map, o) => map.get(o),
      _1720: (map, o, v) => map.set(o, v),
      _1721: () => globalThis.WeakRef,
      _1731: s => JSON.stringify(s),
      _1732: s => printToConsole(s),
      _1733: a => a.join(''),
      _1734: (o, a, b) => o.replace(a, b),
      _1736: (s, t) => s.split(t),
      _1737: s => s.toLowerCase(),
      _1738: s => s.toUpperCase(),
      _1739: s => s.trim(),
      _1740: s => s.trimLeft(),
      _1741: s => s.trimRight(),
      _1743: (s, p, i) => s.indexOf(p, i),
      _1744: (s, p, i) => s.lastIndexOf(p, i),
      _1745: (s) => s.replace(/\$/g, "$$$$"),
      _1746: Object.is,
      _1747: s => s.toUpperCase(),
      _1748: s => s.toLowerCase(),
      _1749: (a, i) => a.push(i),
      _1750: (a, i) => a.splice(i, 1)[0],
      _1752: (a, l) => a.length = l,
      _1753: a => a.pop(),
      _1754: (a, i) => a.splice(i, 1),
      _1756: (a, s) => a.join(s),
      _1757: (a, s, e) => a.slice(s, e),
      _1758: (a, s, e) => a.splice(s, e),
      _1759: (a, b) => a == b ? 0 : (a > b ? 1 : -1),
      _1760: a => a.length,
      _1762: (a, i) => a[i],
      _1763: (a, i, v) => a[i] = v,
      _1765: (o, offsetInBytes, lengthInBytes) => {
        var dst = new ArrayBuffer(lengthInBytes);
        new Uint8Array(dst).set(new Uint8Array(o, offsetInBytes, lengthInBytes));
        return new DataView(dst);
      },
      _1766: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _1767: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _1768: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _1769: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _1770: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _1771: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _1772: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _1774: (o, start, length) => new BigInt64Array(o.buffer, o.byteOffset + start, length),
      _1775: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _1776: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _1777: (t, s) => t.set(s),
      _1779: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _1781: o => o.buffer,
      _1782: o => o.byteOffset,
      _1783: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _1784: (b, o) => new DataView(b, o),
      _1785: (b, o, l) => new DataView(b, o, l),
      _1786: Function.prototype.call.bind(DataView.prototype.getUint8),
      _1787: Function.prototype.call.bind(DataView.prototype.setUint8),
      _1788: Function.prototype.call.bind(DataView.prototype.getInt8),
      _1789: Function.prototype.call.bind(DataView.prototype.setInt8),
      _1790: Function.prototype.call.bind(DataView.prototype.getUint16),
      _1791: Function.prototype.call.bind(DataView.prototype.setUint16),
      _1792: Function.prototype.call.bind(DataView.prototype.getInt16),
      _1793: Function.prototype.call.bind(DataView.prototype.setInt16),
      _1794: Function.prototype.call.bind(DataView.prototype.getUint32),
      _1795: Function.prototype.call.bind(DataView.prototype.setUint32),
      _1796: Function.prototype.call.bind(DataView.prototype.getInt32),
      _1797: Function.prototype.call.bind(DataView.prototype.setInt32),
      _1800: Function.prototype.call.bind(DataView.prototype.getBigInt64),
      _1801: Function.prototype.call.bind(DataView.prototype.setBigInt64),
      _1802: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _1803: Function.prototype.call.bind(DataView.prototype.setFloat32),
      _1804: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _1805: Function.prototype.call.bind(DataView.prototype.setFloat64),
      _1818: (o, t) => o instanceof t,
      _1820: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1820(f,arguments.length,x0) }),
      _1821: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1821(f,arguments.length,x0) }),
      _1822: o => Object.keys(o),
      _1823: (ms, c) =>
      setTimeout(() => dartInstance.exports.$invokeCallback(c),ms),
      _1824: (handle) => clearTimeout(handle),
      _1825: (ms, c) =>
      setInterval(() => dartInstance.exports.$invokeCallback(c), ms),
      _1826: (handle) => clearInterval(handle),
      _1827: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _1828: () => Date.now(),
      _1835: () => new XMLHttpRequest(),
      _1836: (x0,x1,x2,x3) => x0.open(x1,x2,x3),
      _1837: (x0,x1,x2) => x0.setRequestHeader(x1,x2),
      _1838: (x0,x1) => x0.send(x1),
      _1839: x0 => x0.abort(),
      _1840: x0 => x0.getAllResponseHeaders(),
      _1847: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1847(f,arguments.length,x0) }),
      _1848: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._1848(f,arguments.length,x0) }),
      _1854: (x0,x1) => x0.key(x1),
      _1870: (s, m) => {
        try {
          return new RegExp(s, m);
        } catch (e) {
          return String(e);
        }
      },
      _1871: (x0,x1) => x0.exec(x1),
      _1872: (x0,x1) => x0.test(x1),
      _1873: (x0,x1) => x0.exec(x1),
      _1874: (x0,x1) => x0.exec(x1),
      _1875: x0 => x0.pop(),
      _1877: o => o === undefined,
      _1896: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _1898: o => {
        const proto = Object.getPrototypeOf(o);
        return proto === Object.prototype || proto === null;
      },
      _1899: o => o instanceof RegExp,
      _1900: (l, r) => l === r,
      _1901: o => o,
      _1902: o => o,
      _1903: o => o,
      _1904: b => !!b,
      _1905: o => o.length,
      _1908: (o, i) => o[i],
      _1909: f => f.dartFunction,
      _1910: l => arrayFromDartList(Int8Array, l),
      _1911: l => arrayFromDartList(Uint8Array, l),
      _1912: l => arrayFromDartList(Uint8ClampedArray, l),
      _1913: l => arrayFromDartList(Int16Array, l),
      _1914: l => arrayFromDartList(Uint16Array, l),
      _1915: l => arrayFromDartList(Int32Array, l),
      _1916: l => arrayFromDartList(Uint32Array, l),
      _1917: l => arrayFromDartList(Float32Array, l),
      _1918: l => arrayFromDartList(Float64Array, l),
      _1919: x0 => new ArrayBuffer(x0),
      _1920: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _1921: l => arrayFromDartList(Array, l),
      _1922: (s, length) => {
        if (length == 0) return '';
      
        const read = dartInstance.exports.$stringRead1;
        let result = '';
        let index = 0;
        const chunkLength = Math.min(length - index, 500);
        let array = new Array(chunkLength);
        while (index < length) {
          const newChunkLength = Math.min(length - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(s, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      _1923: (s, length) => {
        if (length == 0) return '';
      
        const read = dartInstance.exports.$stringRead2;
        let result = '';
        let index = 0;
        const chunkLength = Math.min(length - index, 500);
        let array = new Array(chunkLength);
        while (index < length) {
          const newChunkLength = Math.min(length - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(s, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      _1924: (s) => {
        let length = s.length;
        let range = 0;
        for (let i = 0; i < length; i++) {
          range |= s.codePointAt(i);
        }
        const exports = dartInstance.exports;
        if (range < 256) {
          if (length <= 10) {
            if (length == 1) {
              return exports.$stringAllocate1_1(s.codePointAt(0));
            }
            if (length == 2) {
              return exports.$stringAllocate1_2(s.codePointAt(0), s.codePointAt(1));
            }
            if (length == 3) {
              return exports.$stringAllocate1_3(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2));
            }
            if (length == 4) {
              return exports.$stringAllocate1_4(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3));
            }
            if (length == 5) {
              return exports.$stringAllocate1_5(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4));
            }
            if (length == 6) {
              return exports.$stringAllocate1_6(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5));
            }
            if (length == 7) {
              return exports.$stringAllocate1_7(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6));
            }
            if (length == 8) {
              return exports.$stringAllocate1_8(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6), s.codePointAt(7));
            }
            if (length == 9) {
              return exports.$stringAllocate1_9(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6), s.codePointAt(7), s.codePointAt(8));
            }
            if (length == 10) {
              return exports.$stringAllocate1_10(s.codePointAt(0), s.codePointAt(1), s.codePointAt(2), s.codePointAt(3), s.codePointAt(4), s.codePointAt(5), s.codePointAt(6), s.codePointAt(7), s.codePointAt(8), s.codePointAt(9));
            }
          }
          const dartString = exports.$stringAllocate1(length);
          const write = exports.$stringWrite1;
          for (let i = 0; i < length; i++) {
            write(dartString, i, s.codePointAt(i));
          }
          return dartString;
        } else {
          const dartString = exports.$stringAllocate2(length);
          const write = exports.$stringWrite2;
          for (let i = 0; i < length; i++) {
            write(dartString, i, s.charCodeAt(i));
          }
          return dartString;
        }
      },
      _1925: () => ({}),
      _1926: () => [],
      _1927: l => new Array(l),
      _1928: () => globalThis,
      _1929: (constructor, args) => {
        const factoryFunction = constructor.bind.apply(
            constructor, [null, ...args]);
        return new factoryFunction();
      },
      _1930: (o, p) => p in o,
      _1931: (o, p) => o[p],
      _1932: (o, p, v) => o[p] = v,
      _1933: (o, m, a) => o[m].apply(o, a),
      _1935: o => String(o),
      _1936: (p, s, f) => p.then(s, f),
      _1937: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _1938: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI8ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1939: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI8ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1940: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI16ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1941: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI16ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1942: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmI32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1943: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmI32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1944: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF32ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1945: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF32ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1946: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const getValue = dartInstance.exports.$wasmF64ArrayGet;
        for (let i = 0; i < length; i++) {
          jsArray[jsArrayOffset + i] = getValue(wasmArray, wasmArrayOffset + i);
        }
      },
      _1947: (jsArray, jsArrayOffset, wasmArray, wasmArrayOffset, length) => {
        const setValue = dartInstance.exports.$wasmF64ArraySet;
        for (let i = 0; i < length; i++) {
          setValue(wasmArray, wasmArrayOffset + i, jsArray[jsArrayOffset + i]);
        }
      },
      _1948: s => {
        if (/[[\]{}()*+?.\\^$|]/.test(s)) {
            s = s.replace(/[[\]{}()*+?.\\^$|]/g, '\\$&');
        }
        return s;
      },
      _1950: x0 => x0.input,
      _1951: x0 => x0.index,
      _1952: x0 => x0.groups,
      _1955: (x0,x1) => x0.exec(x1),
      _1957: x0 => x0.flags,
      _1958: x0 => x0.multiline,
      _1959: x0 => x0.ignoreCase,
      _1960: x0 => x0.unicode,
      _1961: x0 => x0.dotAll,
      _1962: (x0,x1) => x0.lastIndex = x1,
      _1963: (o, p) => p in o,
      _1964: (o, p) => o[p],
      _1965: (o, p, v) => o[p] = v,
      _1967: v => v.toString(),
      _1968: (d, digits) => d.toFixed(digits),
      _1972: x0 => x0.random(),
      _1973: x0 => x0.random(),
      _1977: () => globalThis.Math,
      _1979: () => globalThis.document,
      _1980: () => globalThis.window,
      _1985: (x0,x1) => x0.height = x1,
      _1987: (x0,x1) => x0.width = x1,
      _1991: x0 => x0.head,
      _1993: x0 => x0.classList,
      _1998: (x0,x1) => x0.innerText = x1,
      _1999: x0 => x0.style,
      _2000: x0 => x0.sheet,
      _2002: x0 => x0.offsetX,
      _2003: x0 => x0.offsetY,
      _2004: x0 => x0.button,
      _2017: x0 => x0.status,
      _2018: (x0,x1) => x0.responseType = x1,
      _2020: x0 => x0.response,
      _2072: (x0,x1) => x0.withCredentials = x1,
      _2074: x0 => x0.responseURL,
      _2075: x0 => x0.status,
      _2076: x0 => x0.statusText,
      _2078: (x0,x1) => x0.responseType = x1,
      _2079: x0 => x0.response,
      _2159: x0 => x0.style,
      _3891: () => globalThis.window,
      _3934: x0 => x0.document,
      _3937: x0 => x0.location,
      _3956: x0 => x0.navigator,
      _4220: x0 => x0.localStorage,
      _4228: x0 => x0.href,
      _4347: x0 => x0.userAgent,
      _4567: x0 => x0.length,
      _6550: x0 => x0.target,
      _6654: x0 => x0.baseURI,
      _6661: x0 => x0.lastChild,
      _6671: () => globalThis.document,
      _7113: x0 => x0.tagName,
      _7122: x0 => x0.shadowRoot,
      _11651: (x0,x1) => x0.cursor = x1,
      _11661: (x0,x1) => x0.display = x1,
      _11825: (x0,x1) => x0.height = x1,
      _12037: (x0,x1) => x0.opacity = x1,
      _12515: (x0,x1) => x0.width = x1,
      _13650: () => globalThis.window.flutterCanvasKit,
      _13651: () => globalThis.window._flutter_skwasmInstance,

    };

    const baseImports = {
      dart2wasm: dart2wasm,


      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}

