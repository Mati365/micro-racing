import * as R from 'ramda';

const intervalCountdown = ({times, delay = 1000}, fn) => new Promise((resolve, reject) => {
  const interval = setInterval(
    () => {
      try {
        times--;
        if (times >= 0)
          fn(times);
        else {
          clearInterval(interval);
          resolve();
        }
      } catch (e) {
        clearInterval(interval);
        reject(e);
      }
    },
    delay,
  );
});

export default R.curry(intervalCountdown);
