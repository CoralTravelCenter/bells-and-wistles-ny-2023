window.ASAP ||= (->
    fns = []
    callall = () ->
        f() while f = fns.shift()
    if document.addEventListener
        document.addEventListener 'DOMContentLoaded', callall, false
        window.addEventListener 'load', callall, false
    else if document.attachEvent
        document.attachEvent 'onreadystatechange', callall
        window.attachEvent 'onload', callall
    (fn) ->
        fns.push fn
        callall() if document.readyState is 'complete'
)()

window.preload ||= (what, fn) ->
    what = [what] unless  Array.isArray(what)
    $.when.apply($, ($.ajax(lib, dataType: 'script', cache: true) for lib in what)).done -> fn?()

window.DEBUG = 'APP NAME'

ASAP ->

    preload 'https://cdnjs.cloudflare.com/ajax/libs/proton-engine/5.4.5/proton.min.js', ->
        $snowfall = $('<div id="snowfall"><canvas></canvas></div>')
        $('body').append($snowfall)
        canvas = $snowfall.find('canvas').get(0)
        proton = new Proton()
        emitter = new Proton.Emitter()

        emitter.rate = new Proton.Rate(Proton.getSpan(5, 10), 0.1)

        emitter.addInitialize(new Proton.Radius(1, 3))
        emitter.addInitialize(new Proton.Life(3, 10))
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(.5,1.5), new Proton.Span(150,210), 'polar'))
        emitter.addInitialize(new Proton.Position(new Proton.LineZone(-700,0,700,0)))

        emitter.addBehaviour(new Proton.Alpha(1, .3, new Proton.Span(2, 10)))
        emitter.addBehaviour(new Proton.RandomDrift(2,0, 0))

        emitter.emit()
        proton.addEmitter(emitter)

        renderer = new Proton.CanvasRenderer(canvas)
        proton.addRenderer(renderer)

        syncCanvas = () ->
            canvas.width = $snowfall.width()
            canvas.height = $snowfall.height()
            emitter.p.x = canvas.width / 2
            emitter.p.y = 0

        $(window).on 'resize orientationchange', syncCanvas
        syncCanvas()

        RAFManager.add -> proton.update()