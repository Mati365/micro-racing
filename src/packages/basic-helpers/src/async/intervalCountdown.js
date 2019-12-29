import * as R from 'ramda';

const intervalCountdown = ({times, delay = 1000}, fn) => new Promise((resolve, reject) => {
  const interval = setInterval(
    () => {
      const stopInterval = () => clearInterval(interval);

      try {
        times--;
        if (times >= 0) {
          let killResult = null;
          const resolveInterval = (killValue) => {
            killResult = killValue;
          };

          fn(
            {
              countdown: times,
              stopInterval: resolveInterval,
            },
          );

          if (!R.isNil(killResult)) {
            stopInterval();
            resolve(killResult);
          }
        } else {
          stopInterval();
          resolve();
        }
      } catch (e) {
        stopInterval();
        reject(e);
      }
    },
    delay,
  );
});

export default R.curry(intervalCountdown);
