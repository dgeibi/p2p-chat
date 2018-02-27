const EventObservable = require('./EventObservable')
const noop = require('./noop')

module.exports = ({ emitter, callback, args, disable }) => {
  let on
  let obs

  if (disable) {
    on = (...xx) => emitter.on(...xx)
  } else {
    obs = EventObservable(emitter)
    on = obs.observe
  }

  if (args && args.length) {
    callback(on, ...args)
  } else {
    callback(on)
  }

  if (disable) return noop

  return newCallback => {
    obs.removeAllObservables()
    newCallback(on, ...args)
  }
}
