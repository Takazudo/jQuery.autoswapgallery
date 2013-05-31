/*! jQuery.autoswapgallery (https://github.com/Takazudo/jQuery.autoswapgallery)
 * lastupdate: 2013-05-31
 * version: 0.1.0
 * author: 'Takazudo' Takeshi Takatsudo <takazudo@gmail.com>
 * License: MIT */
(function() {
  var __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  (function($, window, document) {
    var ns;
    ns = {};
    ns.Event = (function() {

      function Event() {}

      Event.prototype.on = function(ev, callback) {
        var evs, name, _base, _i, _len;
        if (this._callbacks == null) {
          this._callbacks = {};
        }
        evs = ev.split(' ');
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
          name = evs[_i];
          (_base = this._callbacks)[name] || (_base[name] = []);
          this._callbacks[name].push(callback);
        }
        return this;
      };

      Event.prototype.once = function(ev, callback) {
        this.on(ev, function() {
          this.off(ev, arguments.callee);
          return callback.apply(this, arguments);
        });
        return this;
      };

      Event.prototype.trigger = function() {
        var args, callback, ev, list, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ev = args.shift();
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
          callback = list[_i];
          if (callback.apply(this, args) === false) {
            break;
          }
        }
        return this;
      };

      Event.prototype.off = function(ev, callback) {
        var cb, i, list, _i, _len, _ref;
        if (!ev) {
          this._callbacks = {};
          return this;
        }
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
          return this;
        }
        if (!callback) {
          delete this._callbacks[ev];
          return this;
        }
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
          cb = list[i];
          if (!(cb === callback)) {
            continue;
          }
          list = list.slice();
          list.splice(i, 1);
          this._callbacks[ev] = list;
          break;
        }
        return this;
      };

      return Event;

    })();
    ns.Timer = (function(_super) {

      __extends(Timer, _super);

      function Timer(interval) {
        this.interval = interval;
        this.anyRestartFired = false;
      }

      Timer.prototype.stop = function() {
        if (this._timerId) {
          return clearTimeout(this._timerId);
        }
      };

      Timer.prototype.restart = function() {
        var _this = this;
        this.anyRestartFired = true;
        this.stop();
        this._timerId = setInterval(function() {
          return _this.trigger('tick');
        }, this.interval);
        return this;
      };

      return Timer;

    })(ns.Event);
    ns.Gallery = (function(_super) {

      __extends(Gallery, _super);

      Gallery.defaults = {
        interval: 2000,
        startDelay: 2000,
        selector_inner: null,
        selector_item: null,
        dragger: null
      };

      function Gallery($el, options) {
        this.$el = $el;
        this.options = $.extend({}, ns.Gallery.defaults, options);
        this.currentIndex = 0;
        this._maxIndex = (this.$el.find(this.options.selector_item)).length - 1;
        this._timer = new ns.Timer(this.options.interval);
        this._initializeFitty();
        this._eventify();
        this._startFirstTimer();
      }

      Gallery.prototype._startFirstTimer = function() {
        var _this = this;
        if (this.options.startDelay) {
          setTimeout(function() {
            if (!_this._timer.anyRestartFired) {
              return _this._timer.restart();
            }
          }, this.options.startDelay);
        } else {
          this._timer.restart();
        }
        return this;
      };

      Gallery.prototype._initializeFitty = function() {
        var o,
          _this = this;
        o = {
          inner: this.options.selector_inner,
          item: this.options.selector_item
        };
        if (this.options.dragger) {
          o.dragger = this.options.dragger;
          o.useonlydragger = true;
        }
        this.$el.touchdraghfitty(o);
        this._fitty = this.$el.data('touchdraghfitty');
        this._fitty.on('indexchange', function(data) {
          _this.currentIndex = data.index;
          return _this._triggerItemchange(data.index);
        });
        this._fitty.on('dragstart', function() {
          return _this._timer.stop();
        });
        this._fitty.on('dragend', function() {
          return _this._timer.restart();
        });
        return this;
      };

      Gallery.prototype._eventify = function() {
        var _this = this;
        this._timer.on('tick', function() {
          return _this.next();
        });
        return this;
      };

      Gallery.prototype.adjustOverIndex = function(index) {
        if (index < 0) {
          return this._maxIndex;
        }
        if (index > this._maxIndex) {
          return 0;
        }
        return index;
      };

      Gallery.prototype._triggerItemchange = function(index) {
        var data;
        data = {
          index: index
        };
        this.trigger('itemchange', data);
        return this;
      };

      Gallery.prototype.to = function(nextIndex, immediately) {
        var animate;
        if (immediately == null) {
          immediately = false;
        }
        this._timer.restart();
        nextIndex = this.adjustOverIndex(nextIndex);
        animate = !immediately;
        this._fitty.to(nextIndex, animate);
        this.currentIndex = nextIndex;
        return this;
      };

      Gallery.prototype.next = function() {
        this.to(this.currentIndex + 1);
        return this;
      };

      Gallery.prototype.prev = function() {
        this.to(this.currentIndex - 1);
        return this;
      };

      return Gallery;

    })(ns.Event);
    $.fn.autoswapgallery = function(options) {
      return this.each(function(i, el) {
        var $el, instance;
        $el = $(el);
        instance = new ns.Gallery($el, options);
        $el.data('autoswapgallery', instance);
      });
    };
    $.AutoswapgalleryNs = ns;
    return $.Autoswapgallery = ns.Gallery;
  })(jQuery, window, document);

}).call(this);
