export default class Pointer {
  constructor(sensitivity) {
    this.sensitivity = sensitivity;

    this.x = 0;
    this.y = 0;

    this.hypot = 0;
    this.radiansAtMouse = null;
  }

  updateCoords({ x, y }) {
    this.x += x;
    this.y += y;

    this.updateDerivs();
  }

  resetCoords(x = 0, y = 0) {
    this.x = x;
    this.y = y;

    this.updateDerivs();
  }

  updateDerivs() {
    this.hypot = Math.hypot(this.x, this.y);

    // swap arg order for atan2 to rotate 90 degrees
    // negate y because movement's positive y is down
    this.radiansAtMouse = Math.atan2(this.x, -this.y);
  }

  overThreshold() {
    // console.log(this.hypot);

    if (this.hypot > this.sensitivity) {
      this.pullBackCoords();
      return true;
    }
    return false;
  }

  pullBackCoords() {
    const ratio = this.hypot / this.sensitivity;

    this.resetCoords(this.x / ratio, this.y / ratio);
  }
}
