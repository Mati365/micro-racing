const asyncTimeout = time => new Promise((resolve) => {
  setTimeout(resolve, time);
});

export default asyncTimeout;
