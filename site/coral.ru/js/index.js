window.ASAP || (window.ASAP = (function() {
  var callall, fns;
  fns = [];
  callall = function() {
    var f, results;
    results = [];
    while (f = fns.shift()) {
      results.push(f());
    }
    return results;
  };
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callall, false);
    window.addEventListener('load', callall, false);
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', callall);
    window.attachEvent('onload', callall);
  }
  return function(fn) {
    fns.push(fn);
    if (document.readyState === 'complete') {
      return callall();
    }
  };
})());

window.preload || (window.preload = function(what, fn) {
  var lib;
  if (!Array.isArray(what)) {
    what = [what];
  }
  return $.when.apply($, (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = what.length; i < len; i++) {
      lib = what[i];
      results.push($.ajax(lib, {
        dataType: 'script',
        cache: true
      }));
    }
    return results;
  })()).done(function() {
    return typeof fn === "function" ? fn() : void 0;
  });
});

window.DEBUG = 'APP NAME';

ASAP(function() {
  return preload('https://cdnjs.cloudflare.com/ajax/libs/proton-engine/5.4.5/proton.min.js', function() {
    var $snowfall, canvas, emitter, proton, renderer, syncCanvas;
    $snowfall = $('<div id="snowfall"><canvas></canvas></div>');
    $('body').append($snowfall);
    canvas = $snowfall.find('canvas').get(0);
    proton = new Proton();
    emitter = new Proton.Emitter();
    emitter.rate = new Proton.Rate(Proton.getSpan(5, 10), 0.1);
    emitter.addInitialize(new Proton.Radius(1, 3));
    emitter.addInitialize(new Proton.Life(3, 10));
    emitter.addInitialize(new Proton.Velocity(new Proton.Span(.5, 1.5), new Proton.Span(150, 210), 'polar'));
    emitter.addInitialize(new Proton.Position(new Proton.LineZone(-700, 0, 700, 0)));
    emitter.addBehaviour(new Proton.Alpha(1, .3, new Proton.Span(2, 10)));
    emitter.addBehaviour(new Proton.RandomDrift(2, 0, 0));
    emitter.emit();
    proton.addEmitter(emitter);
    renderer = new Proton.CanvasRenderer(canvas);
    proton.addRenderer(renderer);
    syncCanvas = function() {
      canvas.width = $snowfall.width();
      canvas.height = $snowfall.height();
      emitter.p.x = canvas.width / 2;
      return emitter.p.y = 0;
    };
    $(window).on('resize orientationchange', syncCanvas);
    syncCanvas();
    return RAFManager.add(function() {
      return proton.update();
    });
  });
});
