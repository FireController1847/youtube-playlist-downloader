let x = 0;
function twirlTimer(msg) {
  const p = ['\\', '|', '/', '-'];
  return setInterval(() => {
    process.stdout.write(`\r${p[x++]} ${msg}`);
    x &= 3;
  }, 250);
}

const proc = twirlTimer('Testing 123');
setTimeout(() => {
  clearInterval(proc);
  twirlTimer('Testing 1234');
}, 5613);