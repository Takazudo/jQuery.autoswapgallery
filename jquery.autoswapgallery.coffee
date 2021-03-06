# encapsulate plugin
do ($=jQuery, window=window, document=document) ->

  ns = {}

  # ============================================================
  # event module

  class ns.Event

    on: (ev, callback) ->
      @_callbacks = {} unless @_callbacks?
      evs = ev.split(' ')
      for name in evs
        @_callbacks[name] or= []
        @_callbacks[name].push(callback)
      return this

    once: (ev, callback) ->
      @on ev, ->
        @off(ev, arguments.callee)
        callback.apply(@, arguments)
      return this

    trigger: (args...) ->
      ev = args.shift()
      list = @_callbacks?[ev]
      return unless list
      for callback in list
        if callback.apply(@, args) is false
          break
      return this

    off: (ev, callback) ->
      unless ev
        @_callbacks = {}
        return this

      list = @_callbacks?[ev]
      return this unless list

      unless callback
        delete @_callbacks[ev]
        return this

      for cb, i in list when cb is callback
        list = list.slice()
        list.splice(i, 1)
        @_callbacks[ev] = list
        break

      return this

  # ============================================================
  # Timer

  class ns.Timer extends ns.Event
    
    constructor: (@interval) ->
      @anyRestartFired = false

    stop: ->
      clearTimeout @_timerId if @_timerId

    restart: ->
      @anyRestartFired = true
      @stop()
      @_timerId = setInterval =>
        @trigger 'tick'
      , @interval
      return this

  # ============================================================
  # Gallery

  class ns.Gallery extends ns.Event
    
    @defaults =
      interval: 2000
      startDelay: 2000
      selector_inner: null
      selector_item: null
      dragger: null

    constructor: (@$el, options) ->
      
      @options = $.extend {}, ns.Gallery.defaults, options

      @currentIndex = 0
      @_maxIndex = (@$el.find @options.selector_item).length - 1

      if @options.interval
        @_timer = new ns.Timer @options.interval
      @_initializeFitty()
      @_eventify()

      @_startFirstTimer()

    _startFirstTimer: ->

      return this unless @_timer

      if @options.startDelay
        setTimeout =>
          unless @_timer.anyRestartFired
            @_timer.restart()
        , @options.startDelay
      else
        @_timer.restart()
      return this

    _initializeFitty: ->

      o =
        inner: @options.selector_inner
        item: @options.selector_item

      if @options.dragger
        o.dragger = @options.dragger
        o.useonlydragger = true

      @$el.touchdraghfitty o
      @_fitty = @$el.data 'touchdraghfitty'

      @_fitty.on 'indexchange', (data) =>
        @currentIndex = data.index
        @_triggerItemchange data.index
      @_fitty.on 'dragstart', =>
        if @_timer?
          @_timer.stop()
      @_fitty.on 'dragend', =>
        if @_timer?
          @_timer.restart()

      return this

    _eventify: ->
      if @_timer?
        @_timer.on 'tick', =>
          @next()
      return this

    adjustOverIndex: (index) ->
      if index < 0
        return @_maxIndex
      if index > @_maxIndex
        return 0
      return index

    _triggerItemchange: (index) ->

      data =
        index: index
      @trigger 'itemchange', data

      return this

    to: (nextIndex, immediately = false) ->

      if @_timer?
        @_timer.restart()
      nextIndex = @adjustOverIndex nextIndex
      animate = not immediately
      @_fitty.to nextIndex, animate
      @currentIndex = nextIndex
      return this

    next: ->

      @to (@currentIndex + 1)
      return this
      
    prev: ->

      @to (@currentIndex - 1)
      return this
      

  # ============================================================
  # bridge to plugin

  $.fn.autoswapgallery = (options) ->
    return @each (i, el) ->
      $el = $(el)
      instance = new ns.Gallery $el, options
      $el.data 'autoswapgallery', instance
      return

  # ============================================================
  # globalify

  $.AutoswapgalleryNs = ns
  $.Autoswapgallery = ns.Gallery

