(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Widget = require('./widget'),
    Shortcut = require('./shortcut'),
    locales = require('./locales');

global.I18n.registryDict(locales);
global.OS.installModule('Timer2',{
  Widget: Widget,
  Shortcut: Shortcut
});


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./locales":2,"./shortcut":4,"./widget":5}],2:[function(require,module,exports){
module.exports = {
};


},{}],3:[function(require,module,exports){
(function (global){
var settings = {
  DEFAULT_UPDATED_INTERVAL: 100,

  DEFAULT_SIZE: {
    width: '250px',
    height: '180px'
  },
  DEFAULT_POSITION: global.Settings.get('default_position'),

  DEFAULT_TIMER_STYLES: {
    fontSize: '18px'
  },

  DEFAULT_HR_STYLES: {
    margin: '10px 0'
  },

  DEFAULT_RECORD_CONTAINER_STYLES: {
    marginBottom: '5px'
  },

  DEFAULT_RECORD_STYLES: {
    fontSize: '16px'
  }
};

module.exports = settings;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
var Link = global.OS.Link;

var Shortcut = React.createClass({displayName: "Shortcut",
  render: function () {
    return (
      React.createElement(Link, {
        className:  this.props.className, 
        onClick:  this.props.onClick}, 

        React.createElement("span", {className: "fa fa-hourglass-half"})
      )
    );
  }
});

module.exports = Shortcut;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
(function (global){
var Mixins = global.OS.Mixins,
    Widget = global.OS.Widget,

    settings = require('./settings');

var _Widget = React.createClass({displayName: "_Widget",
  mixins: [Mixins.WidgetHelper],

  getDefaultProps: function () {
    return {
      updatedInterval: settings.DEFAULT_UPDATED_INTERVAL
    };
  },

  getInitialState: function () {
    return {
      startedMoment: null,
      duration: moment.duration(),
      records: [],
      isPlaying: false,

      size: settings.DEFAULT_SIZE,
      position: settings.DEFAULT_POSITION,
      timerStyles: settings.DEFAULT_TIMER_STYLES,
      hrStyles: settings.DEFAULT_HR_STYLES,
      recordContainerStyles: settings.DEFAULT_RECORD_CONTAINER_STYLES,
      recordStyles: settings.DEFAULT_RECORD_STYLES
    };
  },

  handlePlay: function (e) {
    e.preventDefault();

    var startedMoment = moment(),
        intervalId = setInterval(
          this.updateDuration,
          this.props.updatedInterval
        );

    this.setState({
      startedMoment: startedMoment,
      intervalId: intervalId,
      isPlaying: true
    }, this.saveSettings);
  },

  handleStop: function (e) {
    e.preventDefault();

    clearInterval(this.state.intervalId);
    this.setState({
      startedMoment: null,
      duration: moment.duration(),
      isPlaying: false,
      intervalId: null
    });
  },

  handleRecord: function (e) {
    e.preventDefault();

    var records = this.state.records;
    records.push(this.state.duration);

    this.setState({
      records: records
    });
  },

  updateDuration: function () {
    var startedMoment = this.state.startedMoment,
        duration = moment.duration(
          moment() - startedMoment
        );

    this.setState({
      duration: duration
    });
  },

  _getSettings: function () {
    return {
      size: _.clone(this.state.size),
      position: _.clone(this.state.position)
    };
  },

  getTimerText: function (duration) {
    return sprintf(
      '%(hours)s:%(minutes)s:%(seconds)s.%(milliseconds)s',
      {
        hours: this.formatNumber(duration.hours(), 2),
        minutes: this.formatNumber(duration.minutes(), 2),
        seconds: this.formatNumber(duration.seconds(), 2),
        milliseconds: this.formatNumber(duration.milliseconds(), 3)
      }
    );
  },

  formatNumber: function (value, length) {
    var numberArray = value.toString().split(''),
        numberLength = numberArray.length;

    _.times(length - numberLength, function () {
      numberArray.unshift('0');
    });

    return numberArray.join('');
  },

  componentWillMount: function () {
    this.init();
  },

  _load: function (onLoad) {
    this.loadSettings(onLoad);
  },

  render: function () {
    return (
      React.createElement(Widget.Widget, {widgetStyles:  this.getWidgetStyles() }, 
        React.createElement(Widget.DefaultHeader, {
          title:  s.capitalize(this.getName()), 
          onMouseDownPositionBtn:  this.handleStartMoving, 
          onClickCloseBtn:  this.close, 
          onClickConfigureBtn:  this.openConfigurator}
        ), 

        React.createElement(Widget.Body, null, 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-md-4"}, 
              React.createElement("div", {className: "btn-group"}, 
                 this.getPlayOrStopBtnHTML(), 

                React.createElement(RecordBtn, {
                  disabled:  !this.state.isPlaying, 
                  onClick:  this.handleRecord}
                )
              )
            ), 

            React.createElement("div", {className: "col-md-8"}, 
              React.createElement("span", {style:  this.state.timerStyles}, 
                 this.getTimerText(this.state.duration) 
              )
            )
          ), 

          React.createElement("hr", {style:  this.state.hrStyles}), 

           this.getRecordsHTML() 
        )
      )
    );
  },

  getPlayOrStopBtnHTML: function () {
    if (this.state.isPlaying) {
      return (
        React.createElement(StopBtn, {onClick:  this.handleStop})
      );
    } else {
      return (
        React.createElement(PlayBtn, {onClick:  this.handlePlay})
      );
    }
  },

  getRecordsHTML: function () {
    var records = _.clone(this.state.records),
        records = records.reverse();

    var recordsHTML = _.map(records, function (record) {
      return (
        React.createElement("div", {className: "row", key:  record }, 
          React.createElement("div", {className: "col-md-offset-4 col-md-8", 
            style:  this.state.recordContainerStyles}, 

            React.createElement("span", {style:  this.state.recordStyles}, 
               this.getTimerText(record) 
            )
          )
        )
      );
    }.bind(this))

    return recordsHTML;
  }
});

var PlayBtn = React.createClass({displayName: "PlayBtn",
  render: function () {
    return (
      React.createElement("button", {
        className: "btn btn-default btn-xs", 
        onClick:  this.props.onClick}, 

        React.createElement("span", {className: "glyphicon glyphicon-play"})
      )
    );
  }
});

var StopBtn = React.createClass({displayName: "StopBtn",
  render: function () {
    return (
      React.createElement("button", {
        className: "btn btn-default btn-xs", 
        onClick:  this.props.onClick}, 

        React.createElement("span", {className: "glyphicon glyphicon-stop"})
      )
    );
  }
});

var RecordBtn = React.createClass({displayName: "RecordBtn",
  render: function () {
    var btnClassName;
    if (this.props.disabled) {
      btnClassName = 'btn btn-default btn-xs disabled';
    } else {
      btnClassName = 'btn btn-default btn-xs';
    }

    return (
      React.createElement("button", {
        className:  btnClassName, 
        onClick:  this.props.onClick}, 

        React.createElement("span", {className: "glyphicon glyphicon-check"})
      )
    )
  }
});

module.exports = _Widget;


}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./settings":3}]},{},[1])